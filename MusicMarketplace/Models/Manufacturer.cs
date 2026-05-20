using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Manufacturer")]
    public class Manufacturer
    {
        public int manufacturer_id { get; set; }
        public string name { get; set; }
        public string contact_info { get; set; }
        public string country { get; set; }

        public virtual ICollection<Product> Products { get; set; }
    }
}