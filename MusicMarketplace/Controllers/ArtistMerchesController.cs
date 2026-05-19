using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.DTOs;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistMerchesController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;
        public ArtistMerchesController(MusicMarketplaceContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ArtistMerchDto>>> GetArtistMerches()
        {
            var data = await _context.ArtistMerches
                .Join(_context.Artists, am => am.artist_id, a => a.artist_id, (am, a) => new { am, artist_name = a.name })
                .Join(_context.Merches, x => x.am.merch_id, m => m.merch_id, (x, m) => new { x, merch = m })
                .Join(_context.Products, x => x.merch.product_id, p => p.product_id, (x, p) => new ArtistMerchDto
                {
                    artist_id = x.x.am.artist_id,
                    merch_id = x.x.am.merch_id,
                    artist_name = x.x.artist_name,
                    product_name = p.name
                })
                .ToListAsync();
            return data;
        }

        [HttpGet("byMerch/{merchId}")]
        public async Task<ActionResult<IEnumerable<ArtistMerchDto>>> GetByMerch(int merchId)
        {
            var data = await _context.ArtistMerches
                .Where(am => am.merch_id == merchId)
                .Join(_context.Artists, am => am.artist_id, a => a.artist_id, (am, a) => new ArtistMerchDto
                {
                    artist_id = am.artist_id,
                    merch_id = am.merch_id,
                    artist_name = a.name
                })
                .ToListAsync();
            return data;
        }

        [HttpPost]
        public async Task<ActionResult<ArtistMerch>> PostArtistMerch(ArtistMerch dto)
        {
            _context.ArtistMerches.Add(dto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetArtistMerches), new { }, dto);
        }

        [HttpDelete("{artist_id}/{merch_id}")]
        public async Task<IActionResult> DeleteArtistMerch(int artist_id, int merch_id)
        {
            var entity = await _context.ArtistMerches.FindAsync(artist_id, merch_id);
            if (entity == null) return NotFound();
            _context.ArtistMerches.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}