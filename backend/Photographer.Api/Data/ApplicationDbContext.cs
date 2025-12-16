using Microsoft.EntityFrameworkCore;
using Photographer.Api.Models;

namespace Photographer.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<UploadedImage> UploadedImages => Set<UploadedImage>();
    public DbSet<PhotoCategory> PhotoCategories => Set<PhotoCategory>();
    public DbSet<PhotoItem> PhotoItems => Set<PhotoItem>();
    public DbSet<AvailabilitySlot> AvailabilitySlots => Set<AvailabilitySlot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ContactMessage>(entity =>
        {
            entity.ToTable("contact_messages");
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.ShootDate).HasColumnType("date");
            entity.Property(e => e.Subject).HasMaxLength(300).IsRequired();
            entity.Property(e => e.Message).HasColumnType("TEXT");
            entity.Property(e => e.SubmittedAt).HasColumnType("datetime(6)");
        });

        modelBuilder.Entity<UploadedImage>(entity =>
        {
            entity.ToTable("uploaded_images");
            entity.Property(e => e.OriginalFileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.StoredFileName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Url).HasMaxLength(500).IsRequired();
            entity.Property(e => e.UploadedAt).HasColumnType("datetime(6)");
        });

        modelBuilder.Entity<PhotoCategory>(entity =>
        {
            entity.ToTable("photo_categories");
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.FilterKey).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.FilterKey).IsUnique();
            entity.Property(e => e.CreatedAt).HasColumnType("datetime(6)");
        });

        modelBuilder.Entity<PhotoItem>(entity =>
        {
            entity.ToTable("photo_items");
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Url).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Badge).HasMaxLength(120);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime(6)");
            entity.HasOne(e => e.Category)
                .WithMany(c => c.Photos)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AvailabilitySlot>(entity =>
        {
            entity.ToTable("availability_slots");
            entity.Property(e => e.Date).HasColumnType("date").IsRequired();
            entity.Property(e => e.Note).HasMaxLength(200);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue(AvailabilityStatuses.Available)
                .IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnType("datetime(6)");
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime(6)");
            entity.HasIndex(e => e.Date).IsUnique();
        });
    }
}
