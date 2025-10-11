export interface MainCategoryType {
  id: number;
  name: string;
  main_category_image: string;
  categories: number;
  category_name: string;
}

export interface SubCategoryType {
  id: number;
  name: string;
  sub_category_image: string | null;
}

export interface MainCategoryWithSubCategories {
  categories: number;
  category_name: string;
  sub_categories: SubCategoryType[];
}
