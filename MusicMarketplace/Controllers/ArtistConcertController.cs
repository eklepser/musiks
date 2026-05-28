// Controllers/ArtistConcertsController.cs
using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ArtistConcertsController : ControllerBase
{
    private readonly ArtistConcertsService _service;

    public ArtistConcertsController(ArtistConcertsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("byConcert/{concertId}")]
    public async Task<IActionResult> GetByConcert(int concertId)
    {
        var items = await _service.GetByConcertAsync(concertId);
        return Ok(items);
    }

    [HttpGet("byArtist/{artistId}")]
    public async Task<IActionResult> GetByArtist(int artistId)
    {
        var items = await _service.GetByArtistAsync(artistId);
        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateArtistConcertDto dto)
    {
        try
        {
            var result = await _service.CreateAsync(dto.artist_id, dto.concert_id);
            return CreatedAtAction(nameof(GetAll), new { artistId = dto.artist_id, concertId = dto.concert_id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{artistId}/{concertId}")]
    public async Task<IActionResult> Delete(int artistId, int concertId)
    {
        var deleted = await _service.DeleteAsync(artistId, concertId);
        if (!deleted)
            return NotFound(new { message = "Связь не найдена" });
        return NoContent();
    }
}

public class CreateArtistConcertDto
{
    public int artist_id { get; set; }
    public int concert_id { get; set; }
}