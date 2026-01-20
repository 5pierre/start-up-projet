
bug front react 
le regex affiché et celui pris en compte n'est pas le méme:



minikube addons enable ingress
minikube tunnel # A laisser tourner dans un terminal séparé (Mot de passe admin requis)

Configurer le DNS local ?

kubectl apply -f 01-secrets-config.yaml
kubectl apply -f 02-postgres.yaml
kubectl apply -f 03-backends.yaml
kubectl apply -f 04-frontend.yaml
kubectl apply -f 05-ingress.yaml


# 1. AUTH
docker tag project-final-auth:latest 5pierre/filrouge-auth:latest
docker push 5pierre/filrouge-auth:latest

# 2. STORY
docker tag project-final-story:latest 5pierre/filrouge-story:latest
docker push 5pierre/filrouge-story:latest

# 3. FRONTEND
docker tag project-final-frontend:latest 5pierre/filrouge-front:latest
docker push 5pierre/filrouge-front:latest



?dans les dockerfile il y a des ligne export PORT=4000 cela at'il un impact sur kubernet ?