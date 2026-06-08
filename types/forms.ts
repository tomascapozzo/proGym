export type ClubFormQuestionType =
  | 'text'
  | 'scale'
  | 'multiple_choice'
  | 'yes_no'
  | 'one_rm';

export type ScaleOptions = {
  min: number;
  max: number;
  min_label?: string;
  max_label?: string;
};

export type OneRmOptions = {
  exercise_name: string;
};

export type ClubFormQuestion = {
  id: string;
  form_id: string;
  question_text: string;
  type: ClubFormQuestionType;
  options: ScaleOptions | string[] | OneRmOptions | null;
  required: boolean;
  order_index: number;
  depends_on_question_id: string | null;
  depends_on_answer: 'si' | 'no' | null;
};

export type ClubForm = {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'archived';
  template_type: 'anamnesis' | 'wellness' | null;
};

export type PendingDistribution = {
  id: string;
  form_id: string;
  due_at: string | null;
  form: ClubForm;
};
