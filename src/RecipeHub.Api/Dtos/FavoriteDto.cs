namespace RecipeHub.Api.Dtos;

public record FavoriteDto(
    int RecipeId,
    string RecipeTitle,
    string? RecipeDescription,
    string RecipeDifficulty,
    int RecipePrepTimeMinutes,
    int RecipeCookTimeMinutes,
    int RecipeServings,
    string? RecipeImageUrl,
    string[] RecipeTagNames,
    DateTime FavoritedAt
)
{
    public string Title => RecipeTitle;
    public string? Description => RecipeDescription;
    public string Difficulty => RecipeDifficulty;
    public int PrepTimeMinutes => RecipePrepTimeMinutes;
    public int CookTimeMinutes => RecipeCookTimeMinutes;
    public int Servings => RecipeServings;
    public string? ImageUrl => RecipeImageUrl;
    public string[] TagNames => RecipeTagNames;
}
