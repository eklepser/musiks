using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Order")]
    public class Order
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int order_id { get; set; }
        public int user_id { get; set; }
        public DateTime order_date { get; set; }
        public string status { get; set; }
        public decimal total_amount { get; set; }

        public virtual User user { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }
}