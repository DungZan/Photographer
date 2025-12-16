namespace Photographer.Api.Models;

public record CreatePhotoCategoryRequest(string Name, string FilterKey);

public record CreatePhotoItemRequest(string Title, string? Description, string? Badge, string Url, int CategoryId);