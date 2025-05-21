import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        long n = scanner.nextLong();
        long[] arr = new long[(int) n];

        for (int i = 0; i < n; i++) {
            arr[i] = scanner.nextLong();
        }

        long sum = 0;
        for (int i = 0; i < n; i++) {
            sum += arr[i];
            System.out.print(sum + " ");
        }
        System.out.println();
    }
}
