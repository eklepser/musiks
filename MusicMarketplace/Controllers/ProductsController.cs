using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.DTOs;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ProductsService _productsService;
        public ProductsController(ProductsService productsService)
        {
            _productsService = productsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _productsService.GetAllAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _productsService.GetByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> PostProduct(ProductDto dto)
        {
            try
            {
                var product = await _productsService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetProduct), new { id = product.product_id }, product);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, ProductDto dto)
        {
            try
            {
                await _productsService.UpdateAsync(id, dto);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
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
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                await _productsService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetProductsFiltered(
            [FromQuery] string? searchName = null,
            [FromQuery] string? type = null,
            [FromQuery] int? manufacturerId = null,
            [FromQuery] int? artistId = null,
            [FromQuery] bool inStock = false,
            [FromQuery] decimal? priceMin = null,
            [FromQuery] decimal? priceMax = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? selectedGenres = null)
        {
            var result = await _productsService.GetFilteredAsync(
                searchName, type, manufacturerId, artistId, inStock,
                priceMin, priceMax, sortBy, selectedGenres);
            return Ok(result);
        }

        [HttpGet("filter/names")]
        public async Task<IActionResult> GetProductNames()
        {
            var names = await _productsService.GetNamesAsync();
            return Ok(names);
        }
    }
}