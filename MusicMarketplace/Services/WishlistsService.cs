using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;
using MusicMarketplace.DTOs;

namespace MusicMarketplace.Services
{
    public class WishlistsService
    {
        private readonly MusicMarketplaceContext _context;
        public WishlistsService(MusicMarketplaceContext context) => _context = context;

        public async Task<List<Wishlist>> GetAllAsync()
        {
            return await _context.Wishlists.ToListAsync();
        }

        public async Task<List<WishlistDto>> GetByUserAsync(int userId)
        {
            return await _context.Wishlists
                .Where(w => w.user_id == userId)
                .Join(_context.Products, w => w.product_id, p => p.product_id, (w, p) => new WishlistDto
                {
                    product_id = w.product_id,
                    name = p.name,
                    price = p.price,
                    added_date = w.added_date
                })
                .ToListAsync();
        }

        public async Task CreateAsync(WishlistCreateDto dto)
        {
            var exists = await _context.Wishlists
                .AnyAsync(w => w.user_id == dto.user_id && w.product_id == dto.product_id);
            if (exists) throw new InvalidOperationException("Товар уже в вишлисте");

            var wishlist = new Wishlist
            {
                user_id = dto.user_id,
                product_id = dto.product_id,
                added_date = DateTime.UtcNow
            };
            _context.Wishlists.Add(wishlist);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int userId, int productId)
        {
            var wishlist = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.user_id == userId && w.product_id == productId);
            if (wishlist == null) throw new KeyNotFoundException("Wishlist item not found");
            _context.Wishlists.Remove(wishlist);
            await _context.SaveChangesAsync();
        }

        public async Task<List<object>> GetWishlistFilteredAsync(int userId, string? searchName, string? sortBy)
        {
            var query = _context.Wishlists
                .Where(w => w.user_id == userId)
                .Join(_context.Products, w => w.product_id, p => p.product_id, (w, p) => new { Wishlist = w, Product = p });

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(i => i.Product.name.ToLower().Contains(searchName.ToLower()));

            var list = await query.Select(i => new
            {
                product_id = i.Product.product_id,
                name = i.Product.name,
                price = i.Product.price,
                added_date = i.Wishlist.added_date
            }).ToListAsync();

            list = sortBy switch
            {
                "price_asc" => list.OrderBy(i => i.price).ToList(),
                "price_desc" => list.OrderByDescending(i => i.price).ToList(),
                "date_asc" => list.OrderBy(i => i.added_date).ToList(),
                "date_desc" => list.OrderByDescending(i => i.added_date).ToList(),
                _ => list.OrderByDescending(i => i.added_date).ToList()
            };

            return list.Cast<object>().ToList();
        }
    }
}