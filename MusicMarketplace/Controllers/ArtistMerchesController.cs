using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Models;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistMerchesController : ControllerBase
    {
        private readonly ArtistMerchesService _service;
        public ArtistMerchesController(ArtistMerchesService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetArtistMerches()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("byMerch/{merchId}")]
        public async Task<IActionResult> GetByMerch(int merchId)
        {
            var data = await _service.GetByMerchAsync(merchId);
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> PostArtistMerch(ArtistMerch dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetArtistMerches), new { }, result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{artist_id}/{merch_id}")]
        public async Task<IActionResult> DeleteArtistMerch(int artist_id, int merch_id)
        {
            var deleted = await _service.DeleteAsync(artist_id, merch_id);
            if (!deleted) return NotFound(new { message = "Связь не найдена" });
            return NoContent();
        }
    }
}