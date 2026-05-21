using Microsoft.AspNetCore.Mvc;
using MusicMarketplace.Models;
using MusicMarketplace.Services;

namespace MusicMarketplace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderItemsController : ControllerBase
    {
        private readonly OrderItemsService _orderItemsService;
        public OrderItemsController(OrderItemsService orderItemsService)
        {
            _orderItemsService = orderItemsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrderItems()
        {
            var items = await _orderItemsService.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderItem(int id)
        {
            var item = await _orderItemsService.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderItem(int id, OrderItem orderItem)
        {
            try
            {
                await _orderItemsService.UpdateAsync(id, orderItem);
                return NoContent();
            }
            catch (ArgumentException)
            {
                return BadRequest();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<IActionResult> PostOrderItem(OrderItem orderItem)
        {
            try
            {
                var result = await _orderItemsService.CreateAsync(orderItem);
                return CreatedAtAction(nameof(GetOrderItem), new { id = result.order_id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            try
            {
                await _orderItemsService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("byOrder/{orderId}")]
        public async Task<IActionResult> GetByOrder(int orderId)
        {
            try
            {
                var items = await _orderItemsService.GetByOrderAsync(orderId);
                return Ok(items);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Товары не найдены");
            }
        }
    }
}