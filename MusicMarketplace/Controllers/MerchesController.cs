// MerchesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MerchesController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public MerchesController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Merch>>> GetMerches()
        {
            return await _context.Merches.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Merch>> GetMerch(int id)
        {
            var merch = await _context.Merches.FindAsync(id);
            if (merch == null) return NotFound();
            return merch;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutMerch(int id, Merch merch)
        {
            if (id != merch.merch_id) return BadRequest();
            _context.Entry(merch).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MerchExists(id)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Merch>> PostMerch(Merch merch)
        {
            _context.Merches.Add(merch);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetMerch", new { id = merch.merch_id }, merch);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMerch(int id)
        {
            var merch = await _context.Merches.FindAsync(id);
            if (merch == null) return NotFound();
            _context.Merches.Remove(merch);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool MerchExists(int id)
        {
            return _context.Merches.Any(e => e.merch_id == id);
        }
    }
}