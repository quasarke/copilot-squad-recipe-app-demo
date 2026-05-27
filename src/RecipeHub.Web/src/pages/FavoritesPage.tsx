import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Spinner } from '../components/ui';
import { useFavorites, useRemoveFavorite } from '../hooks';
import styles from './FavoritesPage.module.css';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { data: favorites = [], isLoading, isError, error } = useFavorites();
  const removeFavorite = useRemoveFavorite();

  if (isLoading) {
    return (
      <div className={styles.status}>
        <Spinner label="Loading favorites…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.error}>
        Couldn't load favorites. {error instanceof Error ? error.message : ''}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Favorites</h1>
        <p>Keep the recipes you want to cook again close at hand.</p>
      </div>

      {favorites.length === 0 ? (
        <div className={styles.empty}>
          <h2>No favorites yet</h2>
          <p>Save recipes from the detail page to build your shortlist.</p>
          <Link to="/recipes" className={styles.emptyAction}>
            <Button>Browse recipes</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((favorite) => {
            const totalTimeMinutes =
              favorite.recipePrepTimeMinutes + favorite.recipeCookTimeMinutes;
            const isRemoving =
              removeFavorite.isPending && removeFavorite.variables === favorite.recipeId;

            return (
              <Card
                key={favorite.recipeId}
                title={
                  <div className={styles.cardTitle}>
                    <span>{favorite.recipeTitle}</span>
                    <Badge variant="warning">{favorite.recipeDifficulty}</Badge>
                  </div>
                }
                footer={
                  <div className={styles.cardFooter}>
                    <Button
                      variant="secondary"
                      loading={isRemoving}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFavorite.mutate(favorite.recipeId);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      Remove
                    </Button>
                  </div>
                }
                onClick={() => navigate(`/recipes/${favorite.recipeId}`)}
              >
                <p className={styles.description}>
                  {favorite.recipeDescription ?? 'No description.'}
                </p>
                {favorite.recipeTagNames.length > 0 ? (
                  <div className={styles.tags}>
                    {favorite.recipeTagNames.map((tag) => (
                      <Badge key={tag} variant="info">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className={styles.meta}>
                  <span>{totalTimeMinutes}m total</span>
                  <span>Serves {favorite.recipeServings}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
