using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Manufacturer
{
    public int manufacturer_id { get; set; }

    public string name { get; set; } = null!;

    public string? contact_info { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
