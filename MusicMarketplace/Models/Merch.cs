using System;
using System.Collections.Generic;

namespace MusicMarketplace.Models;

public partial class Merch
{
    public int merch_id { get; set; }

    public int product_id { get; set; }

    public string? material { get; set; }

    public string? color { get; set; }

    public virtual Accessory? Accessory { get; set; }

    public virtual Clothing? Clothing { get; set; }

    public virtual Product product { get; set; } = null!;

    public virtual ICollection<Artist> artists { get; set; } = new List<Artist>();
}
