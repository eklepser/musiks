using Microsoft.EntityFrameworkCore;
using MusicMarketplace.Models;

namespace MusicMarketplace.Services
{
    public class CartsService
    {
        private readonly MusicMarketplaceContext _context;
        public CartsService(MusicMarketplaceContext context) => _context = context;

        public class CartCreateDto
        {
            public int user_id { get; set; }
            public int product_id { get; set; }
            public int quantity { get; set; }
        }

        public class CartDto
        {
            public int product_id { get; set; }
            public string name { get; set; }
            public decimal price { get; set; }
            public int quantity { get; set; }
            public DateTime added_date { get; set; }
        }

        public class CartFilterDto
        {
            public int product_id { get; set; }
            public string name { get; set; }
            public decimal price { get; set; }
            public int quantity { get; set; }
            public DateTime added_date { get; set; }
        }

        public async Task<List<CartDto>> GetByUserAsync(int userId)
        {
            return await _context.Carts
                .Where(c => c.user_id == userId)
                .Join(_context.Products, c => c.product_id, p => p.product_id, (c, p) => new CartDto
                {
                    product_id = c.product_id,
                    name = p.name,
                    price = p.price,
                    quantity = c.quantity,
                    added_date = c.added_date
                })
                .ToListAsync();
        }

        public async Task<int> PostCartAsync(CartCreateDto dto)
        {
            var existing = await _context.Carts
                .FirstOrDefaultAsync(c => c.user_id == dto.user_id && c.product_id == dto.product_id);
            int newQuantity;
            if (existing != null)
            {
                existing.quantity += dto.quantity;
                newQuantity = existing.quantity;
            }
            else
            {
                var cart = new Cart
                {
                    user_id = dto.user_id,
                    product_id = dto.product_id,
                    quantity = dto.quantity,
                    added_date = DateTime.Now
                };
                _context.Carts.Add(cart);
                newQuantity = dto.quantity;
            }
            await _context.SaveChangesAsync();
            return newQuantity;
        }

        public async Task DeleteCartItemAsync(int userId, int productId, int quantity)
        {
            var cartItem = await _context.Carts
                .FirstOrDefaultAsync(c => c.user_id == userId && c.product_id == productId);
            if (cartItem == null) throw new KeyNotFoundException("Cart item not found");

            if (quantity > 0 && quantity < cartItem.quantity)
            {
                cartItem.quantity -= quantity;
            }
            else
            {
                _context.Carts.Remove(cartItem);
            }
            await _context.SaveChangesAsync();
        }

        public async Task<(int orderId, decimal totalAmount)> CheckoutAsync(int userId)
        {
            var cartItems = await _context.Carts
                .Where(c => c.user_id == userId)
                .Include(c => c.product)
                .ToListAsync();

            if (cartItems == null || !cartItems.Any())
                throw new InvalidOperationException("Корзина пуста");

            decimal totalAmount = cartItems.Sum(item => item.quantity * item.product.price);

            var order = new Order
            {
                user_id = userId,
                order_date = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified),
                status = "pending",
                total_amount = totalAmount
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            foreach (var cartItem in cartItems)
            {
                var orderItem = new OrderItem
                {
                    order_id = order.order_id,
                    product_id = cartItem.product_id,
                    quantity = cartItem.quantity,
                    unit_price = cartItem.product.price
                };
                _context.OrderItems.Add(orderItem);
            }

            _context.Carts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return (order.order_id, totalAmount);
        }

        public async Task<List<CartFilterDto>> GetCartFilteredAsync(int userId, string? searchName, string? sortBy)
        {
            var query = _context.Carts
                .Where(c => c.user_id == userId)
                .Join(_context.Products, c => c.product_id, p => p.product_id, (c, p) => new { Cart = c, Product = p });

            if (!string.IsNullOrEmpty(searchName))
                query = query.Where(i => i.Product.name.ToLower().Contains(searchName.ToLower()));

            var list = await query.Select(i => new CartFilterDto
            {
                product_id = i.Product.product_id,
                name = i.Product.name,
                price = i.Product.price,
                quantity = i.Cart.quantity,
                added_date = i.Cart.added_date
            }).ToListAsync();

            return sortBy switch
            {
                "price_asc" => list.OrderBy(i => i.price).ToList(),
                "price_desc" => list.OrderByDescending(i => i.price).ToList(),
                "date_asc" => list.OrderBy(i => i.added_date).ToList(),
                "date_desc" => list.OrderByDescending(i => i.added_date).ToList(),
                _ => list.OrderByDescending(i => i.added_date).ToList()
            };
        }
    }
}