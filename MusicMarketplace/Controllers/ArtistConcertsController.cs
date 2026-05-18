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
        public ArtistConcertsController(MusicMarketplaceContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ArtistConcertDto>>> GetArtistConcerts()
        {
            var data = await _context.ArtistConcerts
                .Join(_context.Artists, ac => ac.artist_id, a => a.artist_id, (ac, a) => new { ac, artist_name = a.name })
                .Join(_context.Concerts, x => x.ac.concert_id, c => c.concert_id, (x, c) => new ArtistConcertDto
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
        public async Task<ActionResult<ArtistConcert>> PostArtistConcert(ArtistConcert dto)
        {
            _context.ArtistConcerts.Add(dto);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetArtistConcerts), new { }, dto);
        }

        [HttpDelete("{artist_id}/{concert_id}")]
        public async Task<IActionResult> DeleteArtistConcert(int artist_id, int concert_id)
        {
            var entity = await _context.ArtistConcerts.FindAsync(artist_id, concert_id);
            if (entity == null) return NotFound();
            _context.ArtistConcerts.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}