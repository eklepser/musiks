using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace MusicMarketplace.Models;

public partial class Review
{
    public int user_id { get; set; }
    public int product_id { get; set; }
    public int rating { get; set; }
    public string? review_text { get; set; }
    public DateTime review_date { get; set; }

    [JsonIgnore]
    [ValidateNever]
    public virtual Product product { get; set; } = null!;

    [JsonIgnore]
    [ValidateNever]
    public virtual User user { get; set; } = null!;
}