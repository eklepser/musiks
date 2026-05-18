using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("Merch")]
    public class Merch
    {
        public int merch_id { get; set; }
        public int product_id { get; set; }
        public string material { get; set; }
        public string color { get; set; }

        public virtual Product Product { get; set; }
        public virtual ICollection<Clothing> Clothings { get; set; }
        public virtual ICollection<Accessory> Accessories { get; set; }
    }
}