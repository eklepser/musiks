using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConcertsController : ControllerBase
    {
        private readonly ConcertsService _concertsService;
        public ConcertsController(ConcertsService concertsService)
        {
            _concertsService = concertsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetConcerts()
        {
            var concerts = await _concertsService.GetAllAsync();
            return Ok(concerts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetConcert(int id)
        {
            var concert = await _concertsService.GetByIdAsync(id);
            if (concert == null) return NotFound();
            return Ok(concert);
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetConcertsFiltered(
            [FromQuery] string? searchTitle = null,
            [FromQuery] string? searchVenue = null,
            [FromQuery] string? status = null,
            [FromQuery] int? artistId = null,
            [FromQuery] string? sortBy = null)
        {
            var result = await _concertsService.GetFilteredAsync(searchTitle, searchVenue, status, artistId, sortBy);
            return Ok(result);
        }

        [HttpGet("filter/artists")]
        public async Task<IActionResult> GetArtistsForFilter()
        {
            var artists = await _concertsService.GetArtistsForFilterAsync();
            return Ok(artists);
        }

        [HttpPost]
        public async Task<IActionResult> PostConcert(ConcertsService.ConcertDto dto)
        {
            try
            {
                var concert = await _concertsService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetConcert), new { id = concert.concert_id }, concert);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutConcert(int id, ConcertsService.ConcertDto dto)
        {
            try
            {
                await _concertsService.UpdateAsync(id, dto);
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
        public async Task<IActionResult> DeleteConcert(int id)
        {
            try
            {
                await _concertsService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}