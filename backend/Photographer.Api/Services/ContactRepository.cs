using Microsoft.EntityFrameworkCore;
using Photographer.Api.Data;
using Photographer.Api.Models;

namespace Photographer.Api.Services;

public class ContactRepository
{
    private readonly ApplicationDbContext _context;

    public ContactRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ContactEntry>> GetAllAsync()
    {
        var entries = await _context.ContactMessages
            .OrderByDescending(entry => entry.SubmittedAt)
            .ToListAsync();

        return entries
            .Select(entry => new ContactEntry(
                entry.Name,
                entry.Email,
                entry.Phone,
                entry.ShootDate,
                entry.Subject,
                entry.Message,
                entry.SubmittedAt))
            .ToList();
    }

    public async Task AddAsync(ContactEntry entry)
    {
        var entity = new ContactMessage
        {
            Name = entry.Name,
            Email = entry.Email,
            Phone = entry.Phone,
            ShootDate = entry.ShootDate,
            Subject = entry.Subject,
            Message = entry.Message,
            SubmittedAt = entry.SubmittedAt
        };

        _context.ContactMessages.Add(entity);
        await _context.SaveChangesAsync();
    }
}
