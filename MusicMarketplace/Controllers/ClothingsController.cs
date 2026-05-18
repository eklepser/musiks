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
    public class ClothingsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public ClothingsController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClothingDto>>> GetClothings()
        {
            var clothings = await (from c in _context.Clothings
                                   join m in _context.Merches on c.merch_id equals m.merch_id
                                   join p in _context.Products on m.product_id equals p.product_id
                                   select new ClothingDto
                                   {
                                       clothing_id = c.clothing_id,
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
            return Ok(clothings);
        }

        [HttpPost]
        public async Task<ActionResult<ClothingDto>> CreateClothing(ClothingDto dto)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

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

            await tx.CommitAsync();

            dto.clothing_id = clothing.clothing_id;
            return CreatedAtAction(nameof(GetClothings), new { id = clothing.clothing_id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClothing(int id, ClothingDto dto)
        {
            if (id != dto.clothing_id) return BadRequest();

            using var tx = await _context.Database.BeginTransactionAsync();

            var clothing = await _context.Clothings.FindAsync(id);
            if (clothing == null) return NotFound();

            var merch = await _context.Merches.FindAsync(clothing.merch_id);
            if (merch == null) return NotFound();

            var product = await _context.Products.FindAsync(merch.product_id);
            if (product == null) return NotFound();

            product.name = dto.name;
            product.price = dto.price;
            product.description = dto.description;
            product.stock = dto.stock;
            product.manufacturer_id = dto.manufacturer_id;

            merch.material = dto.material;
            merch.color = dto.color;

            clothing.size = dto.size;
            clothing.gender = dto.gender;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClothing(int id)
        {
            var clothing = await _context.Clothings.FindAsync(id);
            if (clothing == null) return NotFound();

            var merch = await _context.Merches.FindAsync(clothing.merch_id);
            if (merch != null)
            {
                var product = await _context.Products.FindAsync(merch.product_id);
                if (product != null)
                {
                    var orderItems = _context.OrderItems.Where(oi => oi.product_id == product.product_id);
                    _context.OrderItems.RemoveRange(orderItems);
                    _context.Products.Remove(product);
                }
                _context.Merches.Remove(merch);
            }
            _context.Clothings.Remove(clothing);

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}