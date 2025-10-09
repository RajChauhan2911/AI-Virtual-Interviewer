from google.cloud import storage

storage_client = storage.Client()

def get_bucket(bucket_name: str):
    return storage_client.bucket(bucket_name)