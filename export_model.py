import pandas as pd
import numpy as np
import joblib
import os
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def export_model():
    print("Loading dataset...")
    df = pd.read_csv("dataset.csv")
    
    print(f"Original shape: {df.shape}")
    # Drop rows with NaN values (should just be 1 row according to previous phases)
    df.dropna(inplace=True)
    print(f"Shape after dropping NaNs: {df.shape}")
    
    # Audio features to scale
    audio_features = ['danceability', 'energy', 'key', 'loudness', 'mode', 
                      'speechiness', 'acousticness', 'instrumentalness', 
                      'liveness', 'valence', 'tempo']
    
    # Create the identical ColumnTransformer pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', MinMaxScaler(), audio_features),
            ('cat', OneHotEncoder(sparse_output=False), ['track_genre'])
        ])
    
    print("Fitting the preprocessor to generate the feature matrix...")
    pipeline = Pipeline(steps=[('preprocessor', preprocessor)])
    feature_matrix = pipeline.fit_transform(df)
    
    print("Slicing metadata dataframe...")
    df_meta = df[['track_id', 'track_name', 'artists', 'album_name', 'popularity', 'track_genre']].copy()
    
    # Must reset index so df_meta aligns vertically with the feature_matrix rows
    df_meta.reset_index(drop=True, inplace=True)
    
    # Ensure functions folder exists
    os.makedirs("functions", exist_ok=True)
    
    export_path = "functions/recommender_data.joblib"
    print(f"Exporting model data to '{export_path}'...")
    
    data_to_export = {
        "df_meta": df_meta,
        "feature_matrix": feature_matrix
    }
    
    joblib.dump(data_to_export, export_path)
    
    print(f"Export complete! Feature matrix shape saved: {feature_matrix.shape}")

if __name__ == "__main__":
    export_model()
