using System.Linq;
using Microsoft.EntityFrameworkCore;
using Photographer.Api.Data;
using Photographer.Api.Models;

namespace Photographer.Api.Services;

public class AvailabilityRepository
{
    private readonly ApplicationDbContext _dbContext;

    public AvailabilityRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<AvailabilitySlot>> GetUpcomingAsync()
    {
        var today = DateTime.UtcNow.Date;
        return await _dbContext.AvailabilitySlots
            .AsNoTracking()
            .Where(slot => slot.Date >= today)
            .OrderBy(slot => slot.Date)
            .ToListAsync();
    }

    public async Task<List<AvailabilitySlot>> GetAllAsync()
    {
        return await _dbContext.AvailabilitySlots
            .AsNoTracking()
            .OrderBy(slot => slot.Date)
            .ToListAsync();
    }

    public async Task<AvailabilitySlot?> GetByIdAsync(int id)
    {
        return await _dbContext.AvailabilitySlots.FindAsync(id);
    }

    public async Task<bool> DateExistsAsync(DateTime date, int? excludeId = null)
    {
        var normalizedDate = date.Date;
        var query = _dbContext.AvailabilitySlots.AsQueryable()
            .Where(slot => slot.Date == normalizedDate);

        if (excludeId.HasValue)
        {
            query = query.Where(slot => slot.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<AvailabilitySlot> AddAsync(DateTime date, string? note, string status)
    {
        var slot = new AvailabilitySlot
        {
            Date = date.Date,
            Note = note?.Trim() ?? string.Empty,
            Status = AvailabilityStatuses.Normalize(status),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.AvailabilitySlots.Add(slot);
        await _dbContext.SaveChangesAsync();
        return slot;
    }

    public async Task<AvailabilitySlot?> UpdateAsync(int id, DateTime date, string? note, string status)
    {
        var slot = await _dbContext.AvailabilitySlots.FindAsync(id);
        if (slot is null)
        {
            return null;
        }

        slot.Date = date.Date;
        slot.Note = note?.Trim() ?? string.Empty;
        slot.Status = AvailabilityStatuses.Normalize(status);
        slot.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return slot;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var slot = await _dbContext.AvailabilitySlots.FindAsync(id);
        if (slot is null)
        {
            return false;
        }

        _dbContext.AvailabilitySlots.Remove(slot);
        await _dbContext.SaveChangesAsync();
        return true;
    }
}
