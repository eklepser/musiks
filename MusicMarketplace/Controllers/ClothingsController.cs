using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Clothing>>> GetClothings()
        {
            return await _context.Clothings.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Clothing>> GetClothing(int id)
        {
            var clothing = await _context.Clothings.FindAsync(id);
            if (clothing == null) return NotFound();
            return clothing;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutClothing(int id, ClothingUpdateDto dto)
        {
            if (id != dto.clothing_id) return BadRequest();

            var clothing = await _context.Clothings.FindAsync(id);
            if (clothing == null) return NotFound();

            clothing.merch_id = dto.merch_id;
            clothing.size = dto.size;
            clothing.gender = dto.gender;

            _context.Entry(clothing).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Clothing>> PostClothing(ClothingCreateWithProductDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            var product = new Product
            {
                name = dto.name,
                price = dto.price,
                description = dto.description,
                stock = dto.stock,
                manufacturer_id = dto.manufacturer_id
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var merch = new Merch
            {
                product_id = product.product_id,
                material = dto.material,
                color = dto.color
            };
            _context.Merches.Add(merch);
            await _context.SaveChangesAsync();

            var clothing = new Clothing
            {
                merch_id = merch.merch_id,
                size = dto.size,
                gender = dto.gender
            };
            _context.Clothings.Add(clothing);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetClothing), new { id = clothing.clothing_id }, clothing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClothing(int id)
        {
            var clothing = await _context.Clothings.FindAsync(id);
            if (clothing == null) return NotFound();

            var merch = await _context.Merches.FindAsync(clothing.merch_id);
            Product product = null;
            if (merch != null) product = await _context.Products.FindAsync(merch.product_id);

            _context.Clothings.Remove(clothing);
            if (merch != null) _context.Merches.Remove(merch);
            if (product != null) _context.Products.Remove(product);

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}