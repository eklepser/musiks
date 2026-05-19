using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Wishlist")]
    public class Wishlist
    {
        public int user_id { get; set; }
        public int product_id { get; set; }
        public DateTime added_date { get; set; }
    }
}