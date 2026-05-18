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
    public class ProductsController : ControllerBase
    {
        private readonly MusicMarketplaceContext _context;

        public ProductsController(MusicMarketplaceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return product;
        }

        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(ProductDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.name))
                return BadRequest("Название товара обязательно");

            if (dto.manufacturer_id == 0)
                return BadRequest("Производитель обязателен");

            if (await _context.Products.AnyAsync(p => p.name == dto.name))
                return Conflict("Товар с таким названием уже существует");

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
            return CreatedAtAction(nameof(GetProduct), new { id = product.product_id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, ProductDto dto)
        {
            if (id != dto.product_id) return BadRequest();

            if (string.IsNullOrWhiteSpace(dto.name))
                return BadRequest("Название товара обязательно");

            if (dto.manufacturer_id == 0)
                return BadRequest("Производитель обязателен");

            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            if (await _context.Products.AnyAsync(p => p.name == dto.name && p.product_id != id))
                return Conflict("Товар с таким названием уже существует");

            product.name = dto.name;
            product.price = dto.price;
            product.description = dto.description;
            product.stock = dto.stock;
            product.manufacturer_id = dto.manufacturer_id;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}