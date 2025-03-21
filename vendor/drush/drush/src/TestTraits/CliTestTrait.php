<?php
namespace Drush\TestTraits;

use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessTimedOutException;

/**
 * CliTestTrait provides an `execute()` method that is useful
 * for launching executable programs in functional tests.
 */
trait CliTestTrait
{
    use OutputUtilsTrait;

    /**
     * Default timeout for commands. By default, there is no timeout.
     *
     * @var int
     */
    private $defaultTimeout = 0;

    /**
     * Timeout for command.
     *
     * Reset to $defaultTimeout after executing a command.
     *
     * @var int
     */
    protected $timeout = 0;

    /**
     * Default idle timeout for commands.
     *
     * @var int
     */
    private $defaultIdleTimeout = 0;

    /**
     * Idle timeouts for commands.
     *
     * Reset to $defaultIdleTimeout after executing a command.
     *
     * @var int
     */
    protected $idleTimeout = 0;

    /**
     * @var Process
     */
    protected $process = null;

    /**
     * Accessor for the last output, non-trimmed.
     *
     * @return string
     *   Raw output as text.
     *
     * @access public
     */
    public function getOutputRaw()
    {
        return $this->process ? $this->process->getOutput() : '';
    }

    /**
     * Accessor for the last stderr output, non-trimmed.
     *
     * @return string
     *   Raw stderr as text.
     *
     * @access public
     */
    public function getErrorOutputRaw()
    {
        return $this->process ? $this->process->getErrorOutput() : '';
    }

    /**
     * Actually runs the command.
     *
     * @param string $command
     *   The actual command line to run.
     * @param integer $expected_return
     *   The return code to expect
     * @param sting cd
     *   The directory to run the command in.
     * @param array $env
     *  Extra environment variables.
     * @param string $input
     *   A string representing the STDIN that is piped to the command.
     */
    public function execute($command, $expected_return = 0, $cd = null, $env = null, $input = null)
    {
        try {
            // Process uses a default timeout of 60 seconds, set it to 0 (none).
            $this->process = new Process($command, $cd, $env, $input, 0);
            $this->process->inheritEnvironmentVariables(true);
            if ($this->timeout) {
                $this->process->setTimeout($this->timeout)
                ->setIdleTimeout($this->idleTimeout);
            }
            $return = $this->process->run();
            if ($expected_return !== $return) {
                $message = 'Unexpected exit code ' . $return . ' (expected ' . $expected_return . ") for command:\n" .  $command;
                throw new \Exception($message . $this->buildProcessMessage());
            }
            // Reset timeouts to default.
            $this->timeout = $this->defaultTimeout;
            $this->idleTimeout = $this->defaultIdleTimeout;
        } catch (ProcessTimedOutException $e) {
            if ($e->isGeneralTimeout()) {
                $message = 'Command runtime exceeded ' . $this->timeout . " seconds:\n" .  $command;
            } else {
                $message = 'Command had no output for ' . $this->idleTimeout . " seconds:\n" .  $command;
            }
            throw new \Exception($message . $this->buildProcessMessage());
        }
    }

    public static function escapeshellarg($arg)
    {
        // Short-circuit escaping for simple params (keep stuff readable)
        if (preg_match('|^[a-zA-Z0-9.:/_-]*$|', $arg)) {
            return $arg;
        } elseif (self::isWindows()) {
            return self::_escapeshellargWindows($arg);
        } else {
            return escapeshellarg($arg);
        }
    }

    public static function isWindows()
    {
        return strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
    }

    public static function _escapeshellargWindows($arg)
    {
        // Double up existing backslashes
        $arg = preg_replace('/\\\/', '\\\\\\\\', $arg);

        // Double up double quotes
        $arg = preg_replace('/"/', '""', $arg);

        // Double up percents.
        $arg = preg_replace('/%/', '%%', $arg);

        // Add surrounding quotes.
        $arg = '"' . $arg . '"';

        return $arg;
    }

    /**
     * Borrowed from \Symfony\Component\Process\Exception\ProcessTimedOutException
     *
     * @return string
     */
    public function buildProcessMessage()
    {
        $error = sprintf(
            "%s\n\nExit Code: %s(%s)\n\nWorking directory: %s",
            $this->process->getCommandLine(),
            $this->process->getExitCode(),
            $this->process->getExitCodeText(),
            $this->process->getWorkingDirectory()
        );

        if (!$this->process->isOutputDisabled()) {
            $error .= sprintf(
                "\n\nOutput:\n================\n%s\n\nError Output:\n================\n%s",
                $this->process->getOutput(),
                $this->process->getErrorOutput()
            );
        }

        return $error;
    }

    /**
     * Checks that the output matches the expected output.
     *
     * This matches against a simplified version of the actual output that has
     * absolute paths and duplicate whitespace removed, to avoid false negatives
     * on minor differences.
     *
     * @param string $expected
     *   The expected output.
     * @param string $filter
     *   Optional regular expression that should be ignored in the error output.
     */

    protected function assertOutputEquals($expected, $filter = '')
    {
        $output = $this->getSimplifiedOutput();
        if (!empty($filter)) {
            $output = preg_replace($filter, '', $output);
        }
        $this->assertEquals($expected, $output);
    }

    /**
     * Checks that the error output matches the expected output.
     *
     * This matches against a simplified version of the actual output that has
     * absolute paths and duplicate whitespace removed, to avoid false negatives
     * on minor differences.
     *
     * @param string $expected
     *   The expected output.
     * @param string $filter
     *   Optional regular expression that should be ignored in the error output.
     */
    protected function assertErrorOutputEquals($expected, $filter = '')
    {
        $output = $this->getSimplifiedErrorOutput();
        if (!empty($filter)) {
            $output = preg_replace($filter, '', $output);
        }
        $this->assertEquals($expected, $output);
    }
}
