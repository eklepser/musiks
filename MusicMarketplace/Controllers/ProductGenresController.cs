using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Models;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductGenresController : ControllerBase
    {
        private readonly ProductGenresService _productGenresService;
        public ProductGenresController(ProductGenresService productGenresService) => _productGenresService = productGenresService;

        [HttpGet]
        public async Task<IActionResult> GetProductGenres()
        {
            var data = await _productGenresService.GetAllAsync();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> PostProductGenre(ProductGenre dto)
        {
            try
            {
                var result = await _productGenresService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetProductGenres), new { }, result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{product_id}/{genre_id}")]
        public async Task<IActionResult> DeleteProductGenre(int product_id, int genre_id)
        {
            try
            {
                await _productGenresService.DeleteAsync(product_id, genre_id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}