import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import ThemeToggle from '../components/ThemeToggle';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const resolveAssetUrl = (path) => {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = (client.defaults.baseURL ?? '').replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const AVAILABILITY_STATUS_LABELS = {
  available: 'Còn trống',
  booked: 'Đã có khách',
};

const AdminPage = () => {
  const [contacts, setContacts] = useState([]);
  const [contactsStatus, setContactsStatus] = useState('loading');
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploads, setUploads] = useState([]);
  const [uploadsStatus, setUploadsStatus] = useState('loading');

  const [categories, setCategories] = useState([]);
  const [categoriesStatus, setCategoriesStatus] = useState('loading');
  const [categoryFormStatus, setCategoryFormStatus] = useState('idle');
  const [categoryForm, setCategoryForm] = useState({ name: '', filterKey: '' });
  const [filterDirty, setFilterDirty] = useState(false);

  const [photos, setPhotos] = useState([]);
  const [photosStatus, setPhotosStatus] = useState('loading');
  const [photoFormStatus, setPhotoFormStatus] = useState('idle');
  const [deletingPhotoIds, setDeletingPhotoIds] = useState([]);
  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
    badge: '',
    categoryId: '',
    file: null,
    url: '',
  });
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const photoFileInput = useRef(null);
  const resolvedUploadedUrl = uploadedUrl ? resolveAssetUrl(uploadedUrl) : '';
  const [availability, setAvailability] = useState([]);
  const [availabilityStatus, setAvailabilityStatus] = useState('loading');
  const [availabilityForm, setAvailabilityForm] = useState({ date: '', note: '', status: 'available' });
  const [availabilityFormStatus, setAvailabilityFormStatus] = useState('idle');
  const [editingAvailabilityId, setEditingAvailabilityId] = useState(null);

  const fetchContacts = () => {
    setContactsStatus('loading');
    client
      .get('/api/admin/contacts')
      .then((response) => {
        setContacts(response.data ?? []);
        setContactsStatus('success');
      })
      .catch(() => setContactsStatus('error'));
  };

  useEffect(() => {
    fetchContacts();
    fetchCategories();
    fetchPhotos();
    fetchUploads();
    fetchAvailability();
  }, []);

  const fetchCategories = () => {
    setCategoriesStatus('loading');
    client
      .get('/api/admin/photo-categories')
      .then((response) => {
        setCategories(response.data ?? []);
        setCategoriesStatus('success');
      })
      .catch(() => setCategoriesStatus('error'));
  };

  const fetchPhotos = () => {
    setPhotosStatus('loading');
    client
      .get('/api/admin/photos')
      .then((response) => {
        setPhotos(response.data ?? []);
        setPhotosStatus('success');
      })
      .catch(() => setPhotosStatus('error'));
  };

  const fetchUploads = () => {
    setUploadsStatus('loading');
    client
      .get('/api/admin/uploads')
      .then((response) => {
        setUploads(response.data ?? []);
        setUploadsStatus('success');
      })
      .catch(() => setUploadsStatus('error'));
  };

  const fetchAvailability = () => {
    setAvailabilityStatus('loading');
    client
      .get('/api/admin/availability')
      .then((response) => {
        setAvailability(response.data ?? []);
        setAvailabilityStatus('success');
      })
      .catch(() => setAvailabilityStatus('error'));
  };

  useEffect(() => {
    if (photoForm.file) {
      const objectUrl = URL.createObjectURL(photoForm.file);
      setPhotoPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPhotoPreviewUrl(photoForm.url ? resolveAssetUrl(photoForm.url) : '');
    return undefined;
  }, [photoForm.file, photoForm.url]);

  const handleUpload = (event) => {
    event.preventDefault();
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploadStatus('loading');

    client
      .post('/api/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => {
        setUploadStatus('success');
        setUploadedUrl(response.data.url);
        setFile(null);
        fetchUploads();
      })
      .catch(() => {
        setUploadStatus('error');
        setUploadedUrl('');
      });
  };

  const handleSelectUploaded = (url) => {
    setPhotoForm((prev) => ({ ...prev, url, file: null }));
    setPhotoFormStatus('idle');
    if (photoFileInput.current) {
      photoFileInput.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const photo = photos.find((item) => item.id === photoId);
    const confirmMessage = photo
      ? `Bạn có chắc muốn xóa ảnh "${photo.title}"?`
      : 'Bạn có chắc muốn xóa ảnh này?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingPhotoIds((prev) => (prev.includes(photoId) ? prev : [...prev, photoId]));

    try {
      await client.delete(`/api/admin/photos/${photoId}`);
      setPhotos((prev) => prev.filter((item) => item.id !== photoId));
    } catch (error) {
      window.alert('Không thể xóa ảnh, vui lòng thử lại.');
    } finally {
      setDeletingPhotoIds((prev) => prev.filter((id) => id !== photoId));
    }
  };

  const clearPhotoSource = () => {
    setPhotoForm((prev) => ({ ...prev, url: '', file: null }));
    setPhotoFormStatus('idle');
    if (photoFileInput.current) {
      photoFileInput.current.value = '';
    }
  };

  const resetAvailabilityForm = () => {
    setAvailabilityForm({ date: '', note: '', status: 'available' });
    setEditingAvailabilityId(null);
  };

  const handleAvailabilitySubmit = (event) => {
    event.preventDefault();
    if (!availabilityForm.date) {
      return;
    }

    setAvailabilityFormStatus('loading');
    const payload = {
      date: availabilityForm.date,
      note: availabilityForm.note,
      status: availabilityForm.status,
    };

    const request = editingAvailabilityId
      ? client.put(`/api/admin/availability/${editingAvailabilityId}`, payload)
      : client.post('/api/admin/availability', payload);

    request
      .then(() => {
        setAvailabilityFormStatus('success');
        resetAvailabilityForm();
        fetchAvailability();
      })
      .catch(() => setAvailabilityFormStatus('error'));
  };

  const handleAvailabilityEdit = (slot) => {
    setEditingAvailabilityId(slot.id);
    setAvailabilityForm({
      date: slot.date?.slice(0, 10) ?? '',
      note: slot.note ?? '',
      status: slot.status ?? 'available',
    });
    setAvailabilityFormStatus('idle');
  };

  const handleAvailabilityDelete = async (slotId) => {
    const slot = availability.find((item) => item.id === slotId);
    const confirmMessage = slot
      ? `Xóa ngày trống ${new Date(slot.date).toLocaleDateString('vi-VN')}?`
      : 'Bạn có chắc muốn xóa ngày trống này?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await client.delete(`/api/admin/availability/${slotId}`);
      setAvailability((prev) => prev.filter((item) => item.id !== slotId));
      if (editingAvailabilityId === slotId) {
        resetAvailabilityForm();
        setAvailabilityFormStatus('idle');
      }
    } catch (error) {
      window.alert('Không thể xóa ngày trống, vui lòng thử lại.');
    }
  };

  const handleCategorySubmit = (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      return;
    }
    setCategoryFormStatus('loading');

    client
      .post('/api/admin/photo-categories', {
        name: categoryForm.name,
        filterKey: categoryForm.filterKey,
      })
      .then(() => {
        setCategoryFormStatus('success');
        setCategoryForm({ name: '', filterKey: '' });
        setFilterDirty(false);
        fetchCategories();
      })
      .catch(() => setCategoryFormStatus('error'));
  };

  const handlePhotoSubmit = async (event) => {
    event.preventDefault();
    if (!photoForm.title.trim() || !photoForm.categoryId) {
      setPhotoFormStatus('error');
      return;
    }

    setPhotoFormStatus('loading');

    try {
      let photoUrl = photoForm.url.trim();

      if (photoForm.file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', photoForm.file);
        const uploadResponse = await client.post('/api/admin/uploads', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        photoUrl = uploadResponse.data.url;
      }

      if (!photoUrl) {
        setPhotoFormStatus('error');
        return;
      }

      await client.post('/api/admin/photos', {
        title: photoForm.title,
        description: photoForm.description,
        badge: photoForm.badge,
        categoryId: Number(photoForm.categoryId),
        url: photoUrl,
      });

      setPhotoFormStatus('success');
      setPhotoForm({ title: '', description: '', badge: '', categoryId: '', file: null, url: '' });
      if (photoFileInput.current) {
        photoFileInput.current.value = '';
      }
      fetchPhotos();
      fetchUploads();
    } catch (error) {
      setPhotoFormStatus('error');
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">Admin panel</p>
          <h1>Quản lý nội dung</h1>
        </div>
        <div className="admin-page__actions">
          <ThemeToggle variant="ghost" />
          <Link to="/" className="admin-page__back-link">
            <i className="bi bi-arrow-left"></i> Quay về website
          </Link>
        </div>
      </header>

      <section className="admin-card">
        <div className="admin-card__heading">
          <div>
            <p className="admin-card__eyebrow">Uploads</p>
            <h3>Tải ảnh mới</h3>
          </div>
        </div>
        <form className="admin-upload" onSubmit={handleUpload}>
          <label className="admin-upload__field">
            <span>Chọn ảnh</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <button type="submit" disabled={!file || uploadStatus === 'loading'}>
            {uploadStatus === 'loading' ? 'Đang tải...' : 'Tải ảnh lên'}
          </button>
        </form>
        {uploadStatus === 'success' && resolvedUploadedUrl && (
          <p className="admin-upload__result">
            Ảnh được lưu tại{' '}
            <a href={resolvedUploadedUrl} target="_blank" rel="noreferrer">
              {resolvedUploadedUrl}
            </a>
          </p>
        )}
        {uploadStatus === 'error' && <p className="admin-upload__result admin-upload__result--error">Không thể tải ảnh, thử lại nhé.</p>}
        {uploadsStatus === 'error' && <p className="admin-error">Không thể tải danh sách ảnh đã upload.</p>}
        {uploadsStatus === 'success' && uploads.length > 0 && (
          <div className="admin-upload__gallery">
            <div className="admin-upload__gallery-head">
              <p>Ảnh đã tải lên ({uploads.length})</p>
              <button type="button" className="admin-refresh" onClick={fetchUploads}>
                <i className="bi bi-arrow-repeat"></i>
                Làm mới
              </button>
            </div>
            <div className="admin-upload__grid">
              {uploads.slice(0, 12).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="admin-upload__item"
                  onClick={() => handleSelectUploaded(item.url)}
                >
                  <img src={resolveAssetUrl(item.url)} alt={item.originalFileName || 'Ảnh đã tải'} />
                  <span>{item.originalFileName || 'Dùng ảnh này'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-card__heading">
          <div>
            <p className="admin-card__eyebrow">Danh mục</p>
            <h3>Thêm loại ảnh</h3>
          </div>
        </div>
        <form className="admin-form" onSubmit={handleCategorySubmit}>
          <label>
            <span>Tên danh mục</span>
            <input
              value={categoryForm.name}
              onChange={(event) => {
                const value = event.target.value;
                setCategoryForm((prev) => ({
                  ...prev,
                  name: value,
                  filterKey: filterDirty ? prev.filterKey : slugify(value),
                }));
              }}
            />
          </label>
          <label>
            <span>Filter key</span>
            <input
              value={categoryForm.filterKey}
              onChange={(event) => {
                setFilterDirty(true);
                setCategoryForm((prev) => ({ ...prev, filterKey: slugify(event.target.value) }));
              }}
            />
          </label>
          <button type="submit" disabled={categoryFormStatus === 'loading'}>
            {categoryFormStatus === 'loading' ? 'Đang lưu...' : 'Tạo danh mục'}
          </button>
        </form>
        {categoriesStatus === 'error' && <p className="admin-error">Không thể tải danh mục.</p>}
        {categoriesStatus === 'success' && categories.length > 0 && (
          <ul className="admin-simple-list">
            {categories.map((category) => (
              <li key={category.id}>
                <div>
                  <strong>{category.name}</strong>
                  <p>{category.filterKey}</p>
                </div>
                <span>{category.photoCount} ảnh</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-card__heading">
          <div>
            <p className="admin-card__eyebrow">Portfolio</p>
            <h3>Thêm ảnh</h3>
          </div>
        </div>
        <form className="admin-form" onSubmit={handlePhotoSubmit}>
          <label>
            <span>Tiêu đề</span>
            <input value={photoForm.title} onChange={(event) => setPhotoForm((prev) => ({ ...prev, title: event.target.value }))} />
          </label>
          <label>
            <span>Mô tả ngắn</span>
            <input value={photoForm.description} onChange={(event) => setPhotoForm((prev) => ({ ...prev, description: event.target.value }))} />
          </label>
          <label>
            <span>Badge</span>
            <input value={photoForm.badge} onChange={(event) => setPhotoForm((prev) => ({ ...prev, badge: event.target.value }))} />
          </label>
          <label>
            <span>Danh mục</span>
            <select value={photoForm.categoryId} onChange={(event) => setPhotoForm((prev) => ({ ...prev, categoryId: event.target.value }))}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Ảnh</span>
            <input type="file" accept="image/*" ref={photoFileInput} onChange={(event) => setPhotoForm((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))} />
            <small>Chọn ảnh mới từ máy tính của bạn.</small>
          </label>
          <label>
            <span>URL ảnh có sẵn</span>
            <input
              type="url"
              placeholder="Dán đường dẫn hoặc chọn ảnh đã tải phía trên"
              value={photoForm.url}
              onChange={(event) => setPhotoForm((prev) => ({ ...prev, url: event.target.value }))}
            />
            <small>Bạn có thể dán một URL hoặc nhấp vào ảnh trong mục "Ảnh đã tải lên".</small>
          </label>
          {photoPreviewUrl && (
            <div className="admin-photo-preview">
              <img src={photoPreviewUrl} alt="Xem trước ảnh sắp đăng" />
              <button type="button" className="admin-preview__clear" onClick={clearPhotoSource}>
                <i className="bi bi-x"></i>
                Bỏ chọn ảnh
              </button>
            </div>
          )}
          <button type="submit" disabled={photoFormStatus === 'loading'}>
            {photoFormStatus === 'loading' ? 'Đang thêm...' : 'Thêm ảnh'}
          </button>
          {photoFormStatus === 'success' && <p className="admin-upload__result">Ảnh đã được thêm vào portfolio.</p>}
          {photoFormStatus === 'error' && (
            <p className="admin-upload__result admin-upload__result--error">Không thể thêm ảnh. Hãy kiểm tra lại tiêu đề, danh mục và nguồn ảnh.</p>
          )}
        </form>
        {photosStatus === 'success' && photos.length > 0 && (
          <ul className="admin-photo-list">
            {photos.map((photo) => (
              <li key={photo.id}>
                <img src={resolveAssetUrl(photo.url)} alt={photo.title} />
                <div className="admin-photo-list__meta">
                  <div>
                    <strong>{photo.title}</strong>
                    <p>{photo.categoryName}</p>
                  </div>
                  <button
                    type="button"
                    className="admin-photo-list__delete"
                    onClick={() => handleDeletePhoto(photo.id)}
                    disabled={deletingPhotoIds.includes(photo.id)}
                  >
                    {deletingPhotoIds.includes(photo.id) ? 'Đang xóa...' : 'Xóa ảnh'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-card__heading">
          <div>
            <p className="admin-card__eyebrow">Lịch trống</p>
            <h3>Quản lý ngày còn trống</h3>
          </div>
          <button type="button" className="admin-refresh" onClick={fetchAvailability}>
            <i className="bi bi-arrow-repeat"></i>
            Làm mới
          </button>
        </div>
        <form className="admin-form" onSubmit={handleAvailabilitySubmit}>
          <label>
            <span>Ngày</span>
            <input
              type="date"
              value={availabilityForm.date}
              onChange={(event) => {
                setAvailabilityForm((prev) => ({ ...prev, date: event.target.value }));
                setAvailabilityFormStatus('idle');
              }}
              required
            />
          </label>
          <label>
            <span>Ghi chú (tuỳ chọn)</span>
            <input
              value={availabilityForm.note}
              onChange={(event) => {
                setAvailabilityForm((prev) => ({ ...prev, note: event.target.value }));
                setAvailabilityFormStatus('idle');
              }}
              placeholder="Ví dụ: Chụp ngoại cảnh buổi chiều"
            />
          </label>
          <label>
            <span>Trạng thái</span>
            <select
              value={availabilityForm.status}
              onChange={(event) => {
                setAvailabilityForm((prev) => ({ ...prev, status: event.target.value }));
                setAvailabilityFormStatus('idle');
              }}
            >
              <option value="available">Còn trống</option>
              <option value="booked">Đã có khách</option>
            </select>
          </label>
          <div className="admin-availability__buttons">
            <button type="submit" disabled={availabilityFormStatus === 'loading'}>
              {availabilityFormStatus === 'loading'
                ? 'Đang lưu...'
                : editingAvailabilityId
                  ? 'Cập nhật ngày'
                  : 'Thêm ngày trống'}
            </button>
            {editingAvailabilityId && (
              <button type="button" className="admin-secondary-btn" onClick={() => { resetAvailabilityForm(); setAvailabilityFormStatus('idle'); }}>
                Hủy
              </button>
            )}
          </div>
          {availabilityFormStatus === 'error' && <p className="admin-error">Không thể lưu ngày, hãy thử lại.</p>}
          {availabilityFormStatus === 'success' && <p className="admin-upload__result">Đã lưu lịch trống.</p>}
        </form>
        {availabilityStatus === 'loading' && <p>Đang tải danh sách ngày trống...</p>}
        {availabilityStatus === 'error' && <p className="admin-error">Không thể tải lịch trống.</p>}
        {availabilityStatus === 'success' && availability.length === 0 && <p>Chưa có ngày nào được mở.</p>}
        {availabilityStatus === 'success' && availability.length > 0 && (
          <ul className="admin-availability-list">
            {availability.map((slot) => (
              <li key={slot.id}>
                <div>
                  <strong>
                    {new Date(slot.date).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </strong>
                  <div className="admin-availability-list__meta">
                    <span className={`status-badge status-badge--${slot.status}`}>
                      {AVAILABILITY_STATUS_LABELS[slot.status] ?? 'Còn trống'}
                    </span>
                    {slot.note && <p>{slot.note}</p>}
                  </div>
                </div>
                <div className="admin-availability-list__actions">
                  <button type="button" onClick={() => handleAvailabilityEdit(slot)}>
                    Sửa
                  </button>
                  <button type="button" onClick={() => handleAvailabilityDelete(slot.id)}>
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {availabilityStatus === 'success' && (
          <div className="admin-availability-calendar">
            <p className="admin-card__eyebrow">Lịch tổng quan</p>
            <AvailabilityCalendar slots={availability} months={3} legend={false} />
          </div>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-card__heading">
          <div>
            <p className="admin-card__eyebrow">Inbox</p>
            <h3>Liên hệ gần đây</h3>
          </div>
          <button type="button" onClick={fetchContacts} className="admin-refresh">
            <i className="bi bi-arrow-repeat"></i>
            Làm mới
          </button>
        </div>
        {contactsStatus === 'loading' && <p>Đang tải danh sách...</p>}
        {contactsStatus === 'error' && <p className="admin-error">Không thể tải dữ liệu.</p>}
        {contactsStatus === 'success' && contacts.length === 0 && <p>Chưa có liên hệ nào.</p>}
        {contactsStatus === 'success' && contacts.length > 0 && (
          <ul className="admin-contact-list">
            {contacts.map((entry) => (
              <li key={`${entry.email}-${entry.submittedAt}`}>
                <div className="admin-contact-list__meta">
                  <strong>{entry.name}</strong>
                  <span>{entry.email}</span>
                  {entry.phone && <span>{entry.phone}</span>}
                  {entry.shootDate && (
                    <time className="admin-contact-list__shoot">
                      Ngày chụp: {new Date(entry.shootDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </time>
                  )}
                  <time>{new Date(entry.submittedAt).toLocaleString('vi-VN', { hour12: false })}</time>
                </div>
                <p className="admin-contact-list__subject">{entry.subject}</p>
                <p className="admin-contact-list__message">{entry.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminPage;
