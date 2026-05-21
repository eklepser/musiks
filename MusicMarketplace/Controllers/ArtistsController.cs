using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistsController : ControllerBase
    {
        private readonly ArtistsService _artistsService;
        public ArtistsController(ArtistsService artistsService)
        {
            _artistsService = artistsService;
        }

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
            if (artist == null) return NotFound();
            return Ok(artist);
        }

        [HttpPost]
        public async Task<IActionResult> PostArtist(ArtistsService.ArtistDto dto)
        {
            try
            {
                var artist = await _artistsService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetArtist), new { id = artist.artist_id }, artist);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutArtist(int id, ArtistsService.ArtistDto dto)
        {
            try
            {
                await _artistsService.UpdateAsync(id, dto);
                return NoContent();
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
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
            catch (KeyNotFoundException)
            {
                return NotFound();
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