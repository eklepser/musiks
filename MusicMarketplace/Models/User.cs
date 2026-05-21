using System.ComponentModel.DataAnnotations.Schema;

namespace MusicMarketplace.Models
{
    [Table("User")]
    public class User
    {
        public int user_id { get; set; }
        public string login { get; set; }
        public string email { get; set; }
        public string full_name { get; set; }
        public DateTime registration_date { get; set; }
        public string password_hash { get; set; }

        public virtual ICollection<Cart> Carts { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
    }
}