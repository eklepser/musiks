using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public ProductGenresController(MusicMarketplaceContext context)
        {
            _context = context;
        }

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
        public async Task<ActionResult<ProductGenre>> PostProductGenre(ProductGenre relation)
        {
            _context.ProductGenres.Add(relation);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (await _context.ProductGenres.AnyAsync(pg => pg.product_id == relation.product_id && pg.genre_id == relation.genre_id))
                    return Conflict();
                else throw;
            }
            return CreatedAtAction(nameof(GetProductGenres), new { productId = relation.product_id, genreId = relation.genre_id }, relation);
        }

        [HttpDelete("{productId}/{genreId}")]
        public async Task<IActionResult> DeleteProductGenre(int productId, int genreId)
        {
            var relation = await _context.ProductGenres
                .FirstOrDefaultAsync(pg => pg.product_id == productId && pg.genre_id == genreId);
            if (relation == null) return NotFound();
            _context.ProductGenres.Remove(relation);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}