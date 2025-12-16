namespace Photographer.Api.Models;

public class ContactMessage
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime? ShootDate { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}

public class UploadedImage
{
    public int Id { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

public class PhotoCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FilterKey { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<PhotoItem> Photos { get; set; } = new List<PhotoItem>();
}

public class PhotoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int CategoryId { get; set; }
    public PhotoCategory? Category { get; set; }
}

public class AvailabilitySlot
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Note { get; set; } = string.Empty;
    public string Status { get; set; } = AvailabilityStatuses.Available;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public static class AvailabilityStatuses
{
    public const string Available = "available";
    public const string Booked = "booked";

    public static string Normalize(string? value)
    {
        return value?.Trim().ToLowerInvariant() switch
        {
            Booked => Booked,
            Available => Available,
            _ => Available
        };
    }

    public static bool IsValid(string? value) => value switch
    {
        Available => true,
        Booked => true,
        _ => false
    };
}
