using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClothingsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public ClothingsController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        // GET: api/Clothings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Clothing>>> GetClothings()
        {
            return await _context.Clothings.ToListAsync();
        }

        // GET: api/Clothings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Clothing>> GetClothing(int id)
        {
            var clothing = await _context.Clothings.FindAsync(id);

            if (clothing == null)
            {
                return NotFound();
            }

            return clothing;
        }

        // PUT: api/Clothings/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutClothing(int id, Clothing clothing)
        {
            if (id != clothing.clothing_id)
            {
                return BadRequest();
            }

            _context.Entry(clothing).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClothingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Clothings
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Clothing>> PostClothing(Clothing clothing)
        {
            _context.Clothings.Add(clothing);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetClothing", new { id = clothing.clothing_id }, clothing);
        }

        // DELETE: api/Clothings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClothing(int id)
        {
            var clothing = await _context.Clothings.FindAsync(id);
            if (clothing == null)
            {
                return NotFound();
            }

            _context.Clothings.Remove(clothing);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClothingExists(int id)
        {
            return _context.Clothings.Any(e => e.clothing_id == id);
        }
    }
}
