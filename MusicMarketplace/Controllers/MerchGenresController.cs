using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Models;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MerchGenresController : ControllerBase
    {
        private readonly MerchGenresService _service;
        public MerchGenresController(MerchGenresService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetMerchGenres()
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
        public async Task<IActionResult> PostMerchGenre(MerchGenre dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetMerchGenres), new { }, result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{merchId}/{genreId}")]
        public async Task<IActionResult> DeleteMerchGenre(int merchId, int genreId)
        {
            var deleted = await _service.DeleteAsync(merchId, genreId);
            if (!deleted) return NotFound(new { message = "Связь не найдена" });
            return NoContent();
        }
    }
}