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
    public class ArtistMerchesController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public ArtistMerchesController(MusicMarketplaceContext context)
        {
            _context = context;
        }

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

        [HttpPost]
        public async Task<ActionResult<ArtistMerch>> PostArtistMerch(ArtistMerch relation)
        {
            _context.ArtistMerches.Add(relation);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (await _context.ArtistMerches.AnyAsync(am => am.artist_id == relation.artist_id && am.merch_id == relation.merch_id))
                    return Conflict();
                else throw;
            }
            return CreatedAtAction(nameof(GetArtistMerches), new { artistId = relation.artist_id, merchId = relation.merch_id }, relation);
        }

        [HttpDelete("{artistId}/{merchId}")]
        public async Task<IActionResult> DeleteArtistMerch(int artistId, int merchId)
        {
            var relation = await _context.ArtistMerches
                .FirstOrDefaultAsync(am => am.artist_id == artistId && am.merch_id == merchId);
            if (relation == null) return NotFound();
            _context.ArtistMerches.Remove(relation);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}