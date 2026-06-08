using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LogsController : ControllerBase
{
    private readonly MusicMarketplaceContext _context;

    public LogsController(MusicMarketplaceContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] string? tableName = null,
        [FromQuery] string? operationType = null,
        [FromQuery] string? sortBy = null)
    {
        var query = _context.Set<ChangeLog>().AsQueryable();

        if (!string.IsNullOrEmpty(tableName))
            query = query.Where(l => l.table_name == tableName);

        if (!string.IsNullOrEmpty(operationType))
            query = query.Where(l => l.operation_type == operationType);

        query = sortBy switch
        {
            "date_asc" => query.OrderBy(l => l.changed_at),
            _ => query.OrderByDescending(l => l.changed_at)
        };

        var logs = await query.Select(l => new LogDto
        {
            log_id = l.log_id,
            table_name = l.table_name,
            record_id = l.record_id,
            operation_type = l.operation_type,
            old_data = l.old_data == null ? null : l.old_data.ToString(),
            new_data = l.new_data == null ? null : l.new_data.ToString(),
            changed_at = l.changed_at
        }).ToListAsync();

        return Ok(logs);
    }
}