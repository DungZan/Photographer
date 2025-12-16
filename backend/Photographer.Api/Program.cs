using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Photographer.Api.Data;
using Photographer.Api.Models;
using Photographer.Api.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("Connection string 'Default' is missing.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Photographer API",
        Version = "v1",
        Description = "API cung cấp nội dung portfolio và nhận liên hệ.",
        Contact = new OpenApiContact
        {
            Name = "Phạm Tiến Dũng",
            Email = "aceqcrush@gmail.com",
            Url = new Uri("https://dungzan.github.io/Photographer/")
        }
    });
});

builder.Services.AddSingleton<SiteContentProvider>();
builder.Services.AddScoped<ContactRepository>();
builder.Services.AddScoped<AvailabilityRepository>();
builder.Services.AddSingleton<ImageStorageService>();
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Frontend:Origins").Get<string[]>()
        ?? new[] { "http://localhost:5173" };

    options.AddPolicy("frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

if (string.IsNullOrEmpty(app.Environment.WebRootPath))
{
    app.Environment.WebRootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
}

Directory.CreateDirectory(app.Environment.WebRootPath!);

if (app.Environment.WebRootFileProvider is null)
{
    app.Environment.WebRootFileProvider = new PhysicalFileProvider(app.Environment.WebRootPath!);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("frontend");

app.MapGet("/api/site", async (HttpContext httpContext, SiteContentProvider provider, ApplicationDbContext dbContext) =>
    {
        var content = await provider.GetContentAsync(dbContext);
        var normalized = NormalizePortfolioImageUrls(content, httpContext.Request);
        return Results.Ok(normalized);
    })
    .WithName("GetSiteContent")
    .WithOpenApi();

app.MapPost("/api/contact", async (ContactRequest request, ContactRepository repository, ILoggerFactory loggerFactory) =>
    {
        var logger = loggerFactory.CreateLogger("Contact");
        logger.LogInformation("Contact request from {Name} ({Email}) regarding {Subject}",
            request.Name, request.Email, request.Subject);

        await repository.AddAsync(new ContactEntry(
            request.Name,
            request.Email,
            request.Phone,
            request.ShootDate,
            request.Subject,
            request.Message,
            DateTime.UtcNow));

        return Results.Ok(new
        {
            message = "Cảm ơn bạn! Mình sẽ liên hệ lại sớm nhất."
        });
    })
    .WithName("SubmitContact")
    .WithOpenApi();

app.MapGet("/api/availability", async (AvailabilityRepository repository) =>
    {
        var slots = await repository.GetUpcomingAsync();
        var entries = slots.Select(ToAvailabilityEntry).ToList();
        return Results.Ok(entries);
    })
    .WithName("GetAvailability")
    .WithOpenApi();

app.MapGet("/api/admin/availability", async (AvailabilityRepository repository) =>
    {
        var slots = await repository.GetAllAsync();
        var entries = slots.Select(ToAvailabilityEntry).ToList();
        return Results.Ok(entries);
    })
    .WithName("GetAdminAvailability")
    .WithOpenApi();

app.MapPost("/api/admin/availability", async (AvailabilityRequest request, AvailabilityRepository repository) =>
    {
        if (request.Date == default)
        {
            return Results.BadRequest(new { message = "Ngày không hợp lệ." });
        }

        if (!AvailabilityStatuses.IsValid(request.Status))
        {
            return Results.BadRequest(new { message = "Trạng thái không hợp lệ." });
        }

        if (await repository.DateExistsAsync(request.Date))
        {
            return Results.Conflict(new { message = "Ngày này đã được thêm." });
        }

        var slot = await repository.AddAsync(request.Date, request.Note, request.Status);
        return Results.Ok(ToAvailabilityEntry(slot));
    })
    .WithName("CreateAvailabilitySlot")
    .WithOpenApi()
    .DisableAntiforgery();

app.MapPut("/api/admin/availability/{id:int}", async (int id, AvailabilityRequest request, AvailabilityRepository repository) =>
    {
        if (request.Date == default)
        {
            return Results.BadRequest(new { message = "Ngày không hợp lệ." });
        }

        if (!AvailabilityStatuses.IsValid(request.Status))
        {
            return Results.BadRequest(new { message = "Trạng thái không hợp lệ." });
        }

        if (await repository.DateExistsAsync(request.Date, id))
        {
            return Results.Conflict(new { message = "Ngày này đã được thêm." });
        }

        var slot = await repository.UpdateAsync(id, request.Date, request.Note, request.Status);
        if (slot is null)
        {
            return Results.NotFound(new { message = "Không tìm thấy ngày." });
        }

        return Results.Ok(ToAvailabilityEntry(slot));
    })
    .WithName("UpdateAvailabilitySlot")
    .WithOpenApi()
    .DisableAntiforgery();

app.MapDelete("/api/admin/availability/{id:int}", async (int id, AvailabilityRepository repository) =>
    {
        var deleted = await repository.DeleteAsync(id);
        if (!deleted)
        {
            return Results.NotFound(new { message = "Không tìm thấy ngày." });
        }

        return Results.NoContent();
    })
    .WithName("DeleteAvailabilitySlot")
    .WithOpenApi()
    .DisableAntiforgery();

app.MapGet("/api/admin/contacts", async (ContactRepository repository) =>
    {
        var entries = await repository.GetAllAsync();
        return Results.Ok(entries);
    })
    .WithName("GetContactMessages")
    .WithOpenApi();

app.MapPost("/api/admin/uploads", async (IFormFile? file, ImageStorageService storage, ApplicationDbContext dbContext, ILogger<Program> logger) =>
    {
        if (file is null || file.Length == 0)
        {
            return Results.BadRequest(new { message = "File không hợp lệ." });
        }

        var url = await storage.SaveAsync(file);
        try
        {
            dbContext.UploadedImages.Add(new UploadedImage
            {
                OriginalFileName = Path.GetFileName(file.FileName),
                StoredFileName = Path.GetFileName(url),
                Url = url,
                UploadedAt = DateTime.UtcNow
            });
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Không thể lưu metadata ảnh upload. Tiếp tục trả URL.");
        }

        return Results.Ok(new { url });
    })
    .WithName("UploadImage")
    .WithOpenApi()
    .DisableAntiforgery();

app.MapGet("/api/admin/uploads", async (ApplicationDbContext dbContext, ImageStorageService storage, ILogger<Program> logger) =>
    {
        try
        {
            var uploads = await dbContext.UploadedImages
                .OrderByDescending(upload => upload.UploadedAt)
                .Select(upload => new
                {
                    upload.Id,
                    upload.OriginalFileName,
                    upload.Url,
                    upload.UploadedAt
                })
                .ToListAsync();

            if (uploads.Count == 0)
            {
                return Results.Ok(storage.GetRecentUploads());
            }

            return Results.Ok(uploads);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Không thể truy vấn uploaded_images, fallback sang filesystem.");
            return Results.Ok(storage.GetRecentUploads());
        }
    })
    .WithName("GetUploads")
    .WithOpenApi();

app.MapGet("/api/admin/photo-categories", async (ApplicationDbContext dbContext) =>
    {
        var categories = await dbContext.PhotoCategories
            .Include(category => category.Photos)
            .OrderBy(category => category.Name)
            .Select(category => new
            {
                category.Id,
                category.Name,
                category.FilterKey,
                PhotoCount = category.Photos.Count
            })
            .ToListAsync();

        return Results.Ok(categories);
    })
    .WithName("GetPhotoCategories")
    .WithOpenApi();

app.MapPost("/api/admin/photo-categories", async (CreatePhotoCategoryRequest request, ApplicationDbContext dbContext) =>
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest(new { message = "Tên danh mục không được để trống." });
        }

        var filterKey = string.IsNullOrWhiteSpace(request.FilterKey)
            ? Slugify(request.Name)
            : Slugify(request.FilterKey);

        if (string.IsNullOrWhiteSpace(filterKey))
        {
            return Results.BadRequest(new { message = "Filter key không hợp lệ." });
        }

        var exists = await dbContext.PhotoCategories.AnyAsync(category => category.FilterKey == filterKey);
        if (exists)
        {
            return Results.BadRequest(new { message = "Filter key đã tồn tại." });
        }

        var entity = new PhotoCategory
        {
            Name = request.Name.Trim(),
            FilterKey = filterKey,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.PhotoCategories.Add(entity);
        await dbContext.SaveChangesAsync();

        return Results.Ok(new { entity.Id, entity.Name, entity.FilterKey });
    })
    .WithName("CreatePhotoCategory")
    .WithOpenApi()
    .DisableAntiforgery();

app.MapGet("/api/admin/photos", async (ApplicationDbContext dbContext) =>
    {
        var photos = await dbContext.PhotoItems
            .Include(photo => photo.Category!)
            .OrderByDescending(photo => photo.CreatedAt)
            .Select(photo => new
            {
                photo.Id,
                photo.Title,
                photo.Description,
                photo.Badge,
                photo.Url,
                photo.CategoryId,
                CategoryName = photo.Category!.Name
            })
            .ToListAsync();

        return Results.Ok(photos);
    })
    .WithName("GetPhotos")
    .WithOpenApi();

app.MapPost("/api/admin/photos", async (CreatePhotoItemRequest request, ApplicationDbContext dbContext) =>
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Url))
        {
            return Results.BadRequest(new { message = "Thiếu tiêu đề hoặc URL ảnh." });
        }

        var category = await dbContext.PhotoCategories.FindAsync(request.CategoryId);
        if (category is null)
        {
            return Results.BadRequest(new { message = "Danh mục không tồn tại." });
        }

        var entity = new PhotoItem
        {
            Title = request.Title.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            Badge = request.Badge?.Trim() ?? string.Empty,
            Url = request.Url,
            CategoryId = request.CategoryId,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.PhotoItems.Add(entity);
        await dbContext.SaveChangesAsync();

        return Results.Ok(new { entity.Id });
    })
    .WithName("CreatePhoto")
    .WithOpenApi()
    .DisableAntiforgery();

app.MapDelete("/api/admin/photos/{id:int}", async (int id, ApplicationDbContext dbContext) =>
    {
        var photo = await dbContext.PhotoItems.FindAsync(id);
        if (photo is null)
        {
            return Results.NotFound(new { message = "Ảnh không tồn tại." });
        }

        dbContext.PhotoItems.Remove(photo);
        await dbContext.SaveChangesAsync();
        return Results.NoContent();
    })
    .WithName("DeletePhoto")
    .WithOpenApi()
    .DisableAntiforgery();

app.Run();

static AvailabilityEntry ToAvailabilityEntry(AvailabilitySlot slot)
{
    return new AvailabilityEntry(slot.Id, slot.Date, slot.Note, slot.Status);
}

static string Slugify(string value)
{
    if (string.IsNullOrWhiteSpace(value))
    {
        return string.Empty;
    }

    var chars = value
        .Trim()
        .ToLowerInvariant()
        .Select(ch => char.IsLetterOrDigit(ch) ? ch : '-')
        .ToArray();

    var slug = new string(chars);
    while (slug.Contains("--", StringComparison.Ordinal))
    {
        slug = slug.Replace("--", "-", StringComparison.Ordinal);
    }

    return slug.Trim('-');
}

static SiteContent NormalizePortfolioImageUrls(SiteContent content, HttpRequest request)
{
    if (content.Portfolio?.Items is null || content.Portfolio.Items.Count == 0)
    {
        return content;
    }

    var origin = $"{request.Scheme}://{request.Host}";
    var items = content.Portfolio.Items
        .Select(item =>
        {
            if (string.IsNullOrWhiteSpace(item.Image))
            {
                return item;
            }

            if (!item.Image.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
            {
                return item;
            }

            return item with { Image = $"{origin}{item.Image}" };
        })
        .ToList();

    return content with
    {
        Portfolio = content.Portfolio with { Items = items }
    };
}
