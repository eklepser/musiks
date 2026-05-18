using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("OrderItem")]
    public class OrderItem
    {
        public int order_id { get; set; }
        public int product_id { get; set; }
        public int quantity { get; set; }
        public decimal unit_price { get; set; }

        public virtual Order order { get; set; }
        public virtual Product product { get; set; }
    }
}