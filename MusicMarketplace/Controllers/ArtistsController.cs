using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistsController : ControllerBase
    {
        private readonly ArtistsService _artistsService;
        public ArtistsController(ArtistsService artistsService) => _artistsService = artistsService;

        [HttpGet]
        public async Task<IActionResult> GetArtists()
        {
            var artists = await _artistsService.GetAllAsync();
            return Ok(artists);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArtist(int id)
        {
            var artist = await _artistsService.GetByIdAsync(id);
            if (artist == null) return NotFound(new { message = $"Исполнитель с ID {id} не найден" });
            return Ok(artist);
        }

        [HttpPost]
        public async Task<IActionResult> PostArtist(ArtistDto dto)
        {
            try
            {
                var artist = await _artistsService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetArtist), new { id = artist.artist_id }, artist);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutArtist(int id, ArtistDto dto)
        {
            try
            {
                await _artistsService.UpdateAsync(id, dto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArtist(int id)
        {
            try
            {
                await _artistsService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetArtistsFiltered(
            [FromQuery] string? searchName = null,
            [FromQuery] string? searchCountry = null,
            [FromQuery] string? searchLanguage = null,
            [FromQuery] string? sortBy = null)
        {
            var artists = await _artistsService.GetFilteredAsync(searchName, searchCountry, searchLanguage, sortBy);
            return Ok(artists);
        }
    }
}