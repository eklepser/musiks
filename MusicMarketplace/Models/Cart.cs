using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace MusicMarketplace.Models
{
    [Table("Cart")]
    public class Cart
    {
        public int user_id { get; set; }
        public int product_id { get; set; }
        public int quantity { get; set; }
        public DateTime added_date { get; set; }

        [JsonIgnore]
        [ValidateNever]
        public virtual User user { get; set; } = null!;

        [JsonIgnore]
        [ValidateNever]
        public virtual Product product { get; set; } = null!;
    }
}