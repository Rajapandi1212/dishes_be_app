import { DEFAULT_COURSE, VEG_DIET } from '../utils/constants';
import { pool } from '../utils/db';
import { trimAndLower } from '../utils/helpers';
import { executeQuery } from '../utils/query';
const dishesJson = require('../data/dishes.json');

// Common function to get the PK of table item
const getId = (
  tableData: any[] | undefined,
  tableColumn: string,
  name: string
) => {
  return (
    (tableData?.find(
      (flavor) => trimAndLower(flavor?.[tableColumn]) === trimAndLower(name)
    )?.id as number) || null
  );
};

export const uploadDishes = async () => {
  console.log('=== STARTING ===');
  try {
    if (Array.isArray(dishesJson) && dishesJson?.length > 0) {
      // Fetch the necessary table data to create dishes
      const states = await executeQuery(`SELECT id,name FROM states`);
      const regions = await executeQuery(`SELECT id,name FROM regions`);
      const ingredients = await executeQuery(`SELECT id,name FROM ingredients`);
      const flavors = await executeQuery(`SELECT id,type FROM flavors`);
      const courses = await executeQuery(`SELECT id,type FROM courses`);

      // Map to hold the logic between dish and ingrdient
      const dishIngredientMap: Record<string, any[]> = {};
      const setDishIngredientMap = (
        dishName: string,
        dishIngredients: string
      ) => {
        const ingredientsArray = dishIngredients
          ?.split(',')
          ?.map((ingredient) => trimAndLower(ingredient))
          ?.filter(Boolean)
          ?.map((ingredient) => getId(ingredients?.data, 'name', ingredient));
        dishIngredientMap[dishName] = ingredientsArray;
      };

      const dishesRows: any[][] = [];
      //Prepare dishes table values
      dishesJson?.map((dish, i) => {
        const name = trimAndLower(dish?.name);
        const diet = trimAndLower(dish?.diet) === VEG_DIET;
        const flavor_id = dish?.flavor_profile
          ? getId(flavors?.data, 'type', trimAndLower(dish?.flavor_profile))
          : null;
        const course_id = getId(
          courses?.data,
          'type',
          trimAndLower(dish?.course) ?? DEFAULT_COURSE
        );
        const state_id =
          dish?.state && typeof dish?.state === 'string'
            ? getId(states?.data, 'name', trimAndLower(dish?.state))
            : null;
        const region_id =
          dish?.region && typeof dish?.region === 'string'
            ? getId(regions?.data, 'name', trimAndLower(dish?.region))
            : null;
        const prep_time = dish?.prep_time > 0 ? dish?.prep_time : null;
        const cook_time = dish?.cook_time > 0 ? dish?.cook_time : null;
        dishesRows.push([
          name,
          diet,
          flavor_id,
          course_id,
          state_id,
          region_id,
          prep_time,
          cook_time,
        ]);
        setDishIngredientMap(name, dish?.ingredients);
      });

      //Query to insert dishes
      const insertDishesQuery = `
    INSERT INTO dishes (name, diet, flavor_id, course_id, state_id, region_id, prep_time,cook_time)
    VALUES ${dishesRows?.map((_, index) => `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`)?.join(', ')}
    RETURNING id,name;
    `;

      const createdDishes = await executeQuery(
        insertDishesQuery,
        dishesRows?.flat()
      );

      const dishes_incredients_values = (createdDishes?.data as any)
        ?.flatMap(({ id, name }: { id: number; name: string }) =>
          dishIngredientMap?.[name].map((value) => `(${id}, ${value})`)
        )
        .join(', ');

      // Query to insert dishes ingredients table
      const insertDishesIngredientsQuery = `
  INSERT INTO dishes_ingredients (dish_id, ingredient_id)
  VALUES ${dishes_incredients_values};
`;
      await executeQuery(insertDishesIngredientsQuery);
    } else {
      console.info('No data found.');
    }
  } catch (error) {
    console.error('Error while uploading dishes : ', error);
  }
  console.log('=== COMPLETED ===');
};
