using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;
using MusicMarketplace.Services;
using System.Threading.Tasks;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistConcertsController : ControllerBase
    {
        private readonly ArtistConcertsService _service;
        public ArtistConcertsController(ArtistConcertsService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetArtistConcerts()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> PostArtistConcert(ArtistConcert dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetArtistConcerts), new { }, result);
        }

        [HttpDelete("{artist_id}/{concert_id}")]
        public async Task<IActionResult> DeleteArtistConcert(int artist_id, int concert_id)
        {
            var deleted = await _service.DeleteAsync(artist_id, concert_id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}