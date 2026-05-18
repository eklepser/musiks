using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductGenresController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public ProductGenresController(MusicMarketplaceContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductGenreDto>>> GetProductGenres()
        {
            var data = await _context.ProductGenres
                .Join(_context.Products, pg => pg.product_id, p => p.product_id, (pg, p) => new { pg, product_name = p.name })
                .Join(_context.Genres, x => x.pg.genre_id, g => g.genre_id, (x, g) => new ProductGenreDto
                {
                    product_id = x.pg.product_id,
                    genre_id = x.pg.genre_id,
                    product_name = x.product_name,
                    genre_name = g.name
                })
                .ToListAsync();
            return data;
        }

        [HttpPost]
        public async Task<ActionResult<ProductGenre>> PostProductGenre(ProductGenre dto)
        {
            _context.ProductGenres.Add(dto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProductGenres), new { }, dto);
        }

        [HttpDelete("{product_id}/{genre_id}")]
        public async Task<IActionResult> DeleteProductGenre(int product_id, int genre_id)
        {
            var entity = await _context.ProductGenres.FindAsync(product_id, genre_id);
            if (entity == null) return NotFound();
            _context.ProductGenres.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}