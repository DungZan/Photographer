using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Photographer.Api.Services;

public class ImageStorageService
{
    private readonly string _uploadsPath;
    private readonly ILogger<ImageStorageService> _logger;

    public ImageStorageService(IWebHostEnvironment environment, ILogger<ImageStorageService> logger)
    {
        _logger = logger;
        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        Directory.CreateDirectory(webRoot);

        _uploadsPath = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(_uploadsPath);
    }

    public async Task<string> SaveAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(file.FileName);
        var safeExtension = string.IsNullOrWhiteSpace(extension) ? ".jpg" : extension;
        var fileName = $"{Guid.NewGuid():N}{safeExtension}";
        var absolutePath = Path.Combine(_uploadsPath, fileName);

        await using var stream = File.Create(absolutePath);
        await file.CopyToAsync(stream, cancellationToken);

        _logger.LogInformation("Saved uploaded image to {Path}", absolutePath);

        return $"/uploads/{fileName}";
    }

    public IEnumerable<StoredUploadInfo> GetRecentUploads(int take = 24)
    {
        if (!Directory.Exists(_uploadsPath))
        {
            return Enumerable.Empty<StoredUploadInfo>();
        }

        return Directory
            .EnumerateFiles(_uploadsPath)
            .OrderByDescending(File.GetCreationTimeUtc)
            .Take(take)
            .Select(path =>
            {
                var fileName = Path.GetFileName(path);
                return new StoredUploadInfo(
                    Id: fileName,
                    OriginalFileName: fileName,
                    Url: $"/uploads/{fileName}",
                    UploadedAt: File.GetCreationTimeUtc(path));
            })
            .ToList();
    }
}

public record StoredUploadInfo(string Id, string OriginalFileName, string Url, DateTime UploadedAt);
