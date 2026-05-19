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
        public ClothingsController(MusicMarketplaceContext context) => _context = context;

        public class ClothingDto
        {
            public int clothing_id { get; set; }
            public int product_id { get; set; }
            public string name { get; set; }
            public decimal price { get; set; }
            public string description { get; set; }
            public int stock { get; set; }
            public int? manufacturer_id { get; set; }
            public string material { get; set; }
            public string color { get; set; }
            public string size { get; set; }
            public string gender { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClothingDto>>> GetClothings()
        {
            var items = await (from c in _context.Clothings
                               join m in _context.Merches on c.merch_id equals m.merch_id
                               join p in _context.Products on m.product_id equals p.product_id
                               select new ClothingDto
                               {
                                   clothing_id = c.clothing_id,
                                   product_id = p.product_id,
                                   name = p.name,
                                   price = p.price,
                                   description = p.description,
                                   stock = p.stock,
                                   manufacturer_id = p.manufacturer_id,
                                   material = m.material,
                                   color = m.color,
                                   size = c.size,
                                   gender = c.gender
                               }).ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<Clothing>> PostClothing(Clothing clothing)
        {
            _context.Clothings.Add(clothing);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetClothings), new { id = clothing.clothing_id }, clothing);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutClothing(int id, Clothing clothing)
        {
            if (id != clothing.clothing_id) return BadRequest();
            _context.Entry(clothing).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClothing(int id)
        {
            var clothing = await _context.Clothings.FindAsync(id);
            if (clothing == null) return NotFound();
            _context.Clothings.Remove(clothing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}