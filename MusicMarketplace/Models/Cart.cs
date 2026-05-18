using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Cart")]
    public class Cart
    {
        public int user_id { get; set; }
        public int product_id { get; set; }
        public int quantity { get; set; }
        public DateTime added_date { get; set; }

        public virtual User user { get; set; }
        public virtual Product product { get; set; }
    }
}