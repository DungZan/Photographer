using System.IO;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Photographer.Api.Data;
using Photographer.Api.Models;

namespace Photographer.Api.Services;

public class SiteContentProvider
{
    private readonly SiteContent _baseContent;

    public SiteContentProvider(IWebHostEnvironment environment, ILogger<SiteContentProvider> logger)
    {
        var dataPath = Path.Combine(environment.ContentRootPath, "Data", "siteContent.json");

        if (!File.Exists(dataPath))
        {
            logger.LogError("Site content file not found at {Path}", dataPath);
            throw new FileNotFoundException("Unable to locate site content configuration.", dataPath);
        }

        using var stream = File.OpenRead(dataPath);
        var content = JsonSerializer.Deserialize<SiteContent>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (content is null)
        {
            throw new InvalidOperationException("Failed to parse site content configuration.");
        }

        _baseContent = content;
    }

    public async Task<SiteContent> GetContentAsync(ApplicationDbContext dbContext)
    {
        var categories = await dbContext.PhotoCategories
            .Include(category => category.Photos)
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .ToListAsync();

        if (categories.Count == 0)
        {
            return _baseContent;
        }

        var dbPhotos = categories.SelectMany(category => category.Photos).ToList();
        if (dbPhotos.Count == 0)
        {
            return _baseContent;
        }

        var filters = new List<PortfolioFilter>
        {
            new PortfolioFilter("Tất cả", "all")
        };

        filters.AddRange(categories.Select(category =>
            new PortfolioFilter(category.Name, category.FilterKey)));

        var items = categories
            .SelectMany(category => category.Photos.Select(photo => new PortfolioItem(
                photo.Title,
                photo.Description,
                photo.Url,
                category.FilterKey,
                string.IsNullOrWhiteSpace(photo.Badge) ? "Ảnh" : photo.Badge)))
            .ToList();

        var portfolio = new PortfolioSection(
            _baseContent.Portfolio.Intro,
            filters,
            items);

        return _baseContent with { Portfolio = portfolio };
    }
}
