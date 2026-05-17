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
    public class ArtistConcertsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public ArtistConcertsController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ArtistConcertDto>>> GetArtistConcerts()
        {
            var data = await _context.ArtistConcerts
                .Join(_context.Artists,
                    ac => ac.artist_id,
                    a => a.artist_id,
                    (ac, a) => new { ac, artist_name = a.name })
                .Join(_context.Concerts,
                    x => x.ac.concert_id,
                    c => c.concert_id,
                    (x, c) => new ArtistConcertDto
                    {
                        artist_id = x.ac.artist_id,
                        concert_id = x.ac.concert_id,
                        artist_name = x.artist_name,
                        concert_title = c.title
                    })
                .ToListAsync();

            return data;
        }

        [HttpPost]
        public async Task<ActionResult<ArtistConcert>> PostArtistConcert(ArtistConcert relation)
        {
            _context.ArtistConcerts.Add(relation);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (await _context.ArtistConcerts.AnyAsync(ac => ac.artist_id == relation.artist_id && ac.concert_id == relation.concert_id))
                    return Conflict();
                else throw;
            }
            return CreatedAtAction(nameof(GetArtistConcerts), new { artistId = relation.artist_id, concertId = relation.concert_id }, relation);
        }

        [HttpDelete("{artistId}/{concertId}")]
        public async Task<IActionResult> DeleteArtistConcert(int artistId, int concertId)
        {
            var relation = await _context.ArtistConcerts
                .FirstOrDefaultAsync(ac => ac.artist_id == artistId && ac.concert_id == concertId);
            if (relation == null) return NotFound();
            _context.ArtistConcerts.Remove(relation);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}