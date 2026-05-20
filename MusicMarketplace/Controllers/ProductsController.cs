using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using System;
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
        public ProductsController(MusicMarketplaceContext context) => _context = context;

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

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<object>>> GetProductsFiltered(
            [FromQuery] string? searchName = null,
            [FromQuery] string? type = null,
            [FromQuery] int? manufacturerId = null,
            [FromQuery] int? artistId = null,
            [FromQuery] bool inStock = false,
            [FromQuery] decimal? priceMin = null,
            [FromQuery] decimal? priceMax = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? selectedGenres = null)
        {
            var ticketsQuery = _context.Tickets
                .Include(t => t.concert)
                .Include(t => t.product)
                .Select(t => new
                {
                    product_id = t.product_id,
                    name = t.product.name,
                    price = t.product.price,
                    description = t.product.description,
                    stock = t.product.stock,
                    manufacturer_id = t.product.manufacturer_id,
                    type = "ticket",
                    typeName = "Билет",
                    concert_id = t.concert_id,
                    concert_title = t.concert.title,
                    price_category = t.price_category,
                    quantity = t.quantity
                });

            var clothingsQuery = _context.Clothings
                .Include(c => c.Merch)
                .ThenInclude(m => m.Product)
                .Select(c => new
                {
                    product_id = c.Merch.Product.product_id,
                    name = c.Merch.Product.name,
                    price = c.Merch.Product.price,
                    description = c.Merch.Product.description,
                    stock = c.Merch.Product.stock,
                    manufacturer_id = c.Merch.Product.manufacturer_id,
                    type = "clothing",
                    typeName = "Одежда",
                    material = c.Merch.material,
                    color = c.Merch.color,
                    size = c.size,
                    gender = c.gender
                });

            var accessoriesQuery = _context.Accessories
                .Include(a => a.Merch)
                .ThenInclude(m => m.Product)
                .Select(a => new
                {
                    product_id = a.Merch.Product.product_id,
                    name = a.Merch.Product.name,
                    price = a.Merch.Product.price,
                    description = a.Merch.Product.description,
                    stock = a.Merch.Product.stock,
                    manufacturer_id = a.Merch.Product.manufacturer_id,
                    type = "accessory",
                    typeName = "Аксессуар",
                    material = a.Merch.material,
                    color = a.Merch.color,
                    accessory_type = a.accessory_type,
                    weight = a.weight
                });

            if (!string.IsNullOrEmpty(searchName))
            {
                ticketsQuery = ticketsQuery.Where(t => t.name.ToLower().Contains(searchName.ToLower()));
                clothingsQuery = clothingsQuery.Where(c => c.name.ToLower().Contains(searchName.ToLower()));
                accessoriesQuery = accessoriesQuery.Where(a => a.name.ToLower().Contains(searchName.ToLower()));
            }

            if (!string.IsNullOrEmpty(type))
            {
                if (type == "ticket") clothingsQuery = clothingsQuery.Where(c => false);
                else if (type == "clothing") accessoriesQuery = accessoriesQuery.Where(a => false);
                else if (type == "accessory") ticketsQuery = ticketsQuery.Where(t => false);
            }

            if (manufacturerId.HasValue)
            {
                ticketsQuery = ticketsQuery.Where(t => t.manufacturer_id == manufacturerId.Value);
                clothingsQuery = clothingsQuery.Where(c => c.manufacturer_id == manufacturerId.Value);
                accessoriesQuery = accessoriesQuery.Where(a => a.manufacturer_id == manufacturerId.Value);
            }

            if (inStock)
            {
                ticketsQuery = ticketsQuery.Where(t => t.stock > 0);
                clothingsQuery = clothingsQuery.Where(c => c.stock > 0);
                accessoriesQuery = accessoriesQuery.Where(a => a.stock > 0);
            }

            if (priceMin.HasValue)
            {
                ticketsQuery = ticketsQuery.Where(t => t.price >= priceMin.Value);
                clothingsQuery = clothingsQuery.Where(c => c.price >= priceMin.Value);
                accessoriesQuery = accessoriesQuery.Where(a => a.price >= priceMin.Value);
            }

            if (priceMax.HasValue)
            {
                ticketsQuery = ticketsQuery.Where(t => t.price <= priceMax.Value);
                clothingsQuery = clothingsQuery.Where(c => c.price <= priceMax.Value);
                accessoriesQuery = accessoriesQuery.Where(a => a.price <= priceMax.Value);
            }

            List<int> productIdsWithArtist = null;
            if (artistId.HasValue)
            {
                productIdsWithArtist = await _context.ArtistMerches
                    .Where(am => am.artist_id == artistId.Value)
                    .Join(_context.Merches,
                          am => am.merch_id,
                          m => m.merch_id,
                          (am, m) => m.product_id)
                    .ToListAsync();
                ticketsQuery = ticketsQuery.Where(t => productIdsWithArtist.Contains(t.product_id));
                clothingsQuery = clothingsQuery.Where(c => productIdsWithArtist.Contains(c.product_id));
                accessoriesQuery = accessoriesQuery.Where(a => productIdsWithArtist.Contains(a.product_id));
            }

            List<int> productIdsWithGenre = null;
            if (!string.IsNullOrEmpty(selectedGenres))
            {
                var genreIds = selectedGenres.Split(',').Select(int.Parse).ToList();
                productIdsWithGenre = await _context.ProductGenres
                    .Where(pg => genreIds.Contains(pg.genre_id))
                    .Select(pg => pg.product_id)
                    .ToListAsync();
                ticketsQuery = ticketsQuery.Where(t => productIdsWithGenre.Contains(t.product_id));
                clothingsQuery = clothingsQuery.Where(c => productIdsWithGenre.Contains(c.product_id));
                accessoriesQuery = accessoriesQuery.Where(a => productIdsWithGenre.Contains(a.product_id));
            }

            var tickets = await ticketsQuery.ToListAsync();
            var clothings = await clothingsQuery.ToListAsync();
            var accessories = await accessoriesQuery.ToListAsync();

            var result = tickets.Concat<object>(clothings).Concat(accessories).ToList();

            result = sortBy switch
            {
                "price_asc" => result.OrderBy(p => (decimal)p.GetType().GetProperty("price")?.GetValue(p)).ToList(),
                "price_desc" => result.OrderByDescending(p => (decimal)p.GetType().GetProperty("price")?.GetValue(p)).ToList(),
                "stock_asc" => result.OrderBy(p => (int)p.GetType().GetProperty("stock")?.GetValue(p)).ToList(),
                "stock_desc" => result.OrderByDescending(p => (int)p.GetType().GetProperty("stock")?.GetValue(p)).ToList(),
                _ => result
            };

            return Ok(result);
        }

        [HttpGet("filter/names")]
        public async Task<ActionResult<IEnumerable<string>>> GetProductNames()
        {
            var names = await _context.Products.Select(p => p.name).ToListAsync();
            return Ok(names);
        }
    }
}